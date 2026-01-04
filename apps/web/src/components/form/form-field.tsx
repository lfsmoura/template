import type { AnyFieldApi } from "@tanstack/react-form";
import type { ChangeEvent } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormFieldProps = {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  type?: React.ComponentProps<"input">["type"];
};

export function FormField({
  field,
  label,
  placeholder,
  type = "text",
}: FormFieldProps) {
  const errors = field.state.meta.errors.map(
    (e: unknown) => (e as { message?: string })?.message ?? String(e),
  );

  return (
    <Field>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value as string}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          field.handleChange(e.target.value)
        }
        onBlur={field.handleBlur}
        placeholder={placeholder}
        aria-invalid={errors.length > 0}
      />
      <FieldError errors={errors} />
    </Field>
  );
}
