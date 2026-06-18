import os
import base64
import io
from celery import Celery

# Redis connection string (use docker container name if available, else localhost)
redis_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "smart_agri",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    worker_prefetch_multiplier=1, # Important for heavy ML tasks so they don't pile up on one worker
)

@celery_app.task(name="tasks.predict_disease_async")
def predict_disease_task(b64_image):
    """
    Background task to process image and run MobileNetV2 prediction.
    """
    import numpy as np
    from PIL import Image
    import logging
    
    # Imports specific to ML so we don't import them unless the worker needs them
    from config import IMAGE_SIZE
    from models.disease_model import predict
    
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Starting background disease prediction...")
        # Decode image
        image_bytes = base64.b64decode(b64_image)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Resize and preprocess just like utils.image_processing
        image = image.resize(IMAGE_SIZE, Image.LANCZOS)
        img_array = (np.array(image, dtype=np.float32) / 127.5) - 1.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        result = predict(img_array)
        logger.info("Background prediction complete.")
        return result
    except Exception as e:
        logger.error(f"Background prediction failed: {e}")
        raise e
