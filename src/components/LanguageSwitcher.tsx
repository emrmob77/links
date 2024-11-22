import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { currentLanguage, languages, changeLanguage } = useLanguage();
  const currentLang = languages[currentLanguage];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, { flag, name }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg">{flag}</span>
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}