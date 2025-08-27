
"use client"

import Link from "next/link"
import { Sprout, Globe, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/i18n"

export function Header() {
  const { setTheme } = useTheme()
  const { language, setLanguage } = useLanguage();
  const t = translations[language];


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block font-headline">
              Apna Kam
            </span>
          </Link>
          <nav className="hidden items-center space-x-2 md:flex">
             <Button variant="ghost" asChild>
                <Link href="/blog">{t.blog}</Link>
            </Button>
             <Button variant="ghost" asChild>
                <Link href="/#categories">{t.categories}</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/about">{t.aboutUs}</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/contact">{t.contact}</Link>
            </Button>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
                <Link href="/profile/edit">{t.forWorkers}</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Select language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')}>हिन्दी</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
}

    