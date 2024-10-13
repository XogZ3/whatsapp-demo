'use client';

import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/libs/i18nNavigation';
import { AppConfig } from '@/utils/appConfig';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (event: any) => {
    router.push(pathname, { locale: event });
    router.refresh();
  };

  return (
    <Select
      defaultValue={locale}
      // onChange={handleChange}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-24" aria-label="Select a language">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {AppConfig.locales.map((elt) => (
          <SelectItem key={elt} value={elt}>
            {elt.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
