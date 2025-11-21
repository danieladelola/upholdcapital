
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const roleBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-500 text-primary-foreground hover:bg-primary/80",
        trader:
          "border-transparent bg-blue-500 text-destructive-foreground hover:bg-destructive/80",
        admin:
          "border-transparent bg-red-500 text-destructive-foreground hover:bg-destructive/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface RoleBadgeProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof roleBadgeVariants> {
    role?: string;
}

function RoleBadge({ className, role = "user", ...props }: RoleBadgeProps) {
    const variant = role.toLowerCase() === "trader" ? "trader" : role.toLowerCase() === "admin" ? "admin" : "default";
    return (
        <div className={cn(roleBadgeVariants({variant}), className)} {...props}>
            {role}
        </div>
    );
}

export { RoleBadge, roleBadgeVariants };
