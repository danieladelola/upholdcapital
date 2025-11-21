import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

interface SidebarProps {
  userName: string;
  userBalance: number;
}

export function Sidebar({ userName, userBalance }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-100 h-screen p-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt={userName} />
              <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-bold">{userName}</h2>
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-lg font-semibold">${userBalance.toLocaleString('en-US')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

