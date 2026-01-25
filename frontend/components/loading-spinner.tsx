interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "spin" | "pulse" | "bounce";
  className?: string;
}

export function LoadingSpinner({ size = "md", variant = "spin", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const variantClasses = {
    spin: "animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
    pulse: "animate-pulse rounded-full bg-current opacity-75",
    bounce: "animate-bounce rounded-full bg-current"
  };

  return (
    <div className={`inline-block ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}