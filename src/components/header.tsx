import Link from "next/link"
import { Sprout } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"

export function Header() {
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
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
                <Link href="/profile/edit">For Workers</Link>
            </Button>
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
}
