"""
Image Preprocessing Utilities
==============================
Functions for loading, resizing and normalising uploaded images
before feeding them into the MobileNetV2 disease model.
"""

import io
import numpy as np
from PIL import Image
from config import IMAGE_SIZE


ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "bmp"}


def allowed_file(filename: str) -> bool:
    """Check if uploaded filename has a valid image extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def preprocess_image(file_storage) -> np.ndarray:
    """
    Read an uploaded file, resize to 224×224, normalise to [0, 1]
    and return a batch-ready numpy array of shape (1, 224, 224, 3).

    Parameters
    ----------
    file_storage : werkzeug.datastructures.FileStorage
        The uploaded file from Flask request.files.

    Returns
    -------
    np.ndarray  — shape (1, 224, 224, 3), dtype float32, values in [0, 1].
    """
    # Read bytes into PIL
    image_bytes = file_storage.read()
    image = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB (handles RGBA / grayscale / palette images)
    image = image.convert("RGB")

    # Resize to model input size
    image = image.resize(IMAGE_SIZE, Image.LANCZOS)

    # To numpy and normalise to [-1, 1] (required for MobileNetV2)
    img_array = (np.array(image, dtype=np.float32) / 127.5) - 1.0

    # Add batch dimension → (1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array
