import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const widgetVariants = cva(
  "relative flex flex-col border-2 border-base-200 bg-base-100 text-base-content dark:text-white whitespace-nowrap shadow-md rounded-3xl",
  {
    variants: {
      size: {
        sm: "size-48",
        md: "w-96 h-48",
        lg: "size-96",
      },
      design: {
        default: "p-6",
        mumbai: "p-4",
      },
      variant: {
        default: "",
        secondary: "bg-base-200 text-base-content dark:text-white",
      },
    },
    defaultVariants: {
      size: "sm",
      design: "default",
      variant: "default",
    },
  },
);

export interface WidgetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof widgetVariants> {
  asChild?: boolean;
}

const Widget = React.forwardRef<HTMLDivElement, WidgetProps>(
  ({ className, size, design, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(widgetVariants({ size, design, variant, className }))}
      {...props}
    />
  ),
);
Widget.displayName = "Widget";

/* ---------------- Header ---------------- */

const WidgetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-semibold flex flex-none items-start justify-between dark:text-white",
      className,
    )}
    {...props}
  />
));
WidgetHeader.displayName = "WidgetHeader";

/* ---------------- Title ---------------- */

const WidgetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "leading-none font-semibold tracking-tight dark:text-white",
      className,
    )}
    {...props}
  />
));
WidgetTitle.displayName = "WidgetTitle";

/* ---------------- Content ---------------- */

const WidgetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-1 items-center justify-center dark:text-white [&_*]:dark:text-white",
      className,
    )}
    {...props}
  />
));
WidgetContent.displayName = "WidgetContent";

/* ---------------- Footer ---------------- */

const WidgetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-none items-center justify-between dark:text-white",
      className,
    )}
    {...props}
  />
));
WidgetFooter.displayName = "WidgetFooter";

/* ---------------- Exports ---------------- */

export {
  Widget,
  WidgetHeader,
  WidgetTitle,
  WidgetContent,
  WidgetFooter,
  widgetVariants,
};
