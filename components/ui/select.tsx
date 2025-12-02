'use client';

import * as React from 'react';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';

// گزینه‌ استاندارد
export interface SelectOption {
  value: string;
  label: string;
}

// ساده‌ترین helper برای ترکیب کلاس‌ها
function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ');
}

type BaseProps = {
  className?: string;
};

// پراپس عمومی برای single و multi
export type SelectProps = BaseProps &
  Omit<ReactSelectProps<SelectOption, boolean>, 'className' | 'classNames'>;

// تم سازگار با UI فعلی (تاریک، accent بنفش)
const customStyles: ReactSelectProps<SelectOption, boolean>['styles'] = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--bg-tertiary)',
    borderColor: state.isFocused ? 'var(--accent)' : 'rgba(129,140,248,0.4)',
    boxShadow: state.isFocused ? '0 0 0 1px rgba(129,140,248,0.7)' : 'none',
    color: 'var(--text-primary)',
    minHeight: '2.5rem',
    '&:hover': {
      borderColor: 'var(--accent)',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'rgba(129,140,248,0.3)'
      : state.isFocused
      ? 'rgba(129,140,248,0.15)'
      : 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgba(129,140,248,0.25)',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'var(--text-primary)',
  }),
  multiValueRemove: (base) => ({
    ...base,
    ':hover': {
      backgroundColor: 'rgba(239,68,68,0.3)',
      color: '#fee2e2',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--text-secondary)',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--text-primary)',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--text-primary)',
  }),
};

// کامپوننت عمومی Select که هم single و هم multi را پشتیبانی می‌کند
export function Select(props: SelectProps) {
  const { className, ...rest } = props;

  return (
    <div className={cx('w-full text-sm', className)}>
      <ReactSelect
        {...rest}
        styles={customStyles}
        classNamePrefix="mf-select"
        // برای RTL، react-select خودش خوب عمل می‌کند؛ در صورت نیاز می‌توان dir را اینجا تنظیم کرد
      />
    </div>
  );
}

