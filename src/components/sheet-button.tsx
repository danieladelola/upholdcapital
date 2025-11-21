import { type LucideIcon } from "lucide-react";
export default function SheetButton({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon?: LucideIcon;
}) {
  return (
    <div className="settings_option_item text-left w-full group">

      {Icon?<div className="settings_option_item_icon">
        <Icon />
      </div>:<></>}
      <div className="settings_option_item_content">
        <p className="title group-hover:text-primary-foreground">{title}</p>
        <p className="description group-hover:text-primary-foreground">
          {description}
        </p>
      </div>
    </div>

  );
}
