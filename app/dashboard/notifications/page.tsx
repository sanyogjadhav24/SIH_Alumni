import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "connection",
      title: "New Connection Request",
      message: "  Chen wants to connect with you.",
      details: "Product Manager at Meta",
      time: "5 minutes ago",
      avatar: "SC",
      actions: ["Accept", "Decline"],
    },
    {
      id: 2,
      type: "post",
      title: "Post Interaction",
      message:
        "Alex Rodriguez & others liked your post about AI in healthcare.",
      details: "Data Scientist at Google",
      time: "2 hours ago",
      avatar: "AR",
      actions: ["View", "Dismiss"],
    },
    {
      id: 3,
      type: "job",
      title: "New Job Opportunity",
      message:
        "Senior Software Engineer position at Microsoft matches your profile.",
      time: "1 day ago",
      actions: ["View", "Pass"],
    },
    {
      id: 4,
      type: "event",
      title: "Event Reminder",
      message: "Alumni Tech Meetup starts in 2 hours.",
      time: "2 hours ago",
      actions: ["Join", "Skip"],
    },
    {
      id: 5,
      type: "message",
      title: "New Message",
      message: "Alex Garcia sent you a message.",
      details: "UX Designer at Adobe",
      time: "1 day ago",
      avatar: "AG",
      actions: ["Reply", "View"],
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
          >
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          >
            Mark All Read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="all"
            className="relative data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="relative data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            Unread
            <Badge className="ml-2 bg-red-500 text-white text-xs">3</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            Connections
          </TabsTrigger>
          <TabsTrigger
            value="jobs"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>7 notifications</span>
            <span>3 unread</span>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className="hover:shadow-sm transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {notification.avatar && (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {notification.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      {notification.details && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {notification.details}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {notification.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={index === 0 ? "default" : "outline"}
                          className={
                            index === 0
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "border-gray-200 dark:border-gray-700"
                          }
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <div className="space-y-4">
            {notifications.slice(0, 3).map((notification) => (
              <Card
                key={notification.id}
                className="border-l-4 border-l-blue-500 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {notification.avatar && (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {notification.avatar}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      {notification.details && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {notification.details}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {notification.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={index === 0 ? "default" : "outline"}
                          className={
                            index === 0
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "border-gray-200 dark:border-gray-700"
                          }
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No connection notifications</p>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No job notifications</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
