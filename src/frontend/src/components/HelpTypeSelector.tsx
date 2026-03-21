/**
 * Multi-select checkbox group for the three Help Type options.
 * Can be used in forms and inline editors.
 */
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const HELP_TYPE_OPTIONS = [
  "User Growth/Marketing",
  "Product Development",
  "Capital",
] as const;

interface Props {
  value: Array<string>;
  onChange: (next: Array<string>) => void;
  label?: string;
}

export default function HelpTypeSelector({ value, onChange, label }: Props) {
  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      )}
      <div className="flex flex-col gap-2">
        {HELP_TYPE_OPTIONS.map((option) => {
          const checkId = `help-type-${option.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
          return (
            <div key={option} className="flex items-center gap-2">
              <Checkbox
                id={checkId}
                checked={value.includes(option)}
                onCheckedChange={() => toggle(option)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={checkId}
                className="cursor-pointer text-sm font-normal hover:text-foreground transition-colors"
              >
                {option}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
