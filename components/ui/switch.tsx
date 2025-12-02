'use client';

import * as React from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';

// نسخه سازگار با Radix شبیه نمونه‌ای که فرستادی، ولی با رنگ‌های تم پروژه

const baseRoot =
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent ' +
  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'data-[state=checked]:bg-accent data-[state=unchecked]:bg-bg-tertiary';

const baseThumb =
  'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 ' +
  'transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0';

function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ');
}

type SwitchRootProps = React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>;

type SwitchProps = SwitchRootProps & {
  // برای سازگاری با استفاده‌های قبلی که از onChange استفاده می‌کردند
  onChange?: (checked: boolean) => void;
};

export const Switch = React.forwardRef<
  React.ElementRef<typeof RadixSwitch.Root>,
  SwitchProps
>(({ className, onChange, onCheckedChange, ...props }, ref) => (
  <RadixSwitch.Root
    dir="ltr"
    ref={ref}
    className={cx(baseRoot, className)}
    // اولویت با onCheckedChange، در غیر این صورت onChange قدیمی
    onCheckedChange={onCheckedChange ?? onChange}
    {...props}
  >
    <RadixSwitch.Thumb className={baseThumb} />
  </RadixSwitch.Root>
));

Switch.displayName = 'Switch';

