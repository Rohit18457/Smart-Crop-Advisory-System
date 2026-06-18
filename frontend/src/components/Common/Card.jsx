import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-100',
  action,
  noPadding = false,
  hover = true,
  ...props 
}) => {
  return (
    <div 
      className={`
        card
        ${hover ? 'hover:-translate-y-0.5' : ''}
        ${noPadding ? 'p-0' : ''}
        ${className}
      `} 
      {...props}
    >
      {(title || Icon || action) && (
        <div className={`flex items-center justify-between ${noPadding ? 'px-6 pt-6' : ''} mb-5`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2.5 ${iconBg} rounded-xl`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-semibold text-surface-900">{title}</h3>}
              {subtitle && <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? 'px-6 pb-6' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Card;