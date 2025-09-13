import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Users, MessageCircle } from "lucide-react";

export default function NetworkPage() {
  const networkStats = [
    { label: "Connections", value: "3", color: "bg-primary" },
    { label: "Pending", value: "12", color: "bg-green-500" },
    { label: "Mutual", value: "8", color: "bg-purple-500" },
    { label: "This Week", value: "5", color: "bg-orange-500" },
  ];

  const connections = [
    {
      id: 1,
      name: " Sanyog J",
      role: "Software Engineer at Microsoft",
      batch: "Class of 2018",
      location: "Seattle, WA",
      mutualConnections: 5,
      avatar: "AC",
    },
    {
      id: 2,
      name: "   Aditya",
      role: "Product Manager at Google",
      batch: "Class of 2019",
      location: "Mountain View, CA",
      mutualConnections: 12,
      avatar: "PS",
    },
    {
      id: 3,
      name: " Aayusha",
      role: "Data Scientist at Meta",
      batch: "Class of 2020",
      location: "Menlo Park, CA",
      mutualConnections: 8,
      avatar: "JD",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Network
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Connect with fellow alumni and expand your professional network
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Users className="h-4 w-4 mr-2" />
          Invite Alumni
        </Button>
      </div>

      {/* Network Overview */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Users className="h-5 w-5" />
            Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {networkStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`${stat.color} text-white rounded-lg p-4 mb-2`}>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search alumni by name, company, or batch..."
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="connections"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            Connections
          </TabsTrigger>
          <TabsTrigger
            value="suggestions"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            Suggestions
          </TabsTrigger>
          <TabsTrigger
            value="invitations"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              156 connections
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              12 new this week
            </p>
          </div>

          <div className="space-y-4">
            {connections.map((person) => (
              <Card
                key={person.id}
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-white">
                        {person.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {person.role}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mt-1">
                        <span>{person.batch}</span>
                        <span>{person.location}</span>
                        <span>
                          {person.mutualConnections} mutual connections
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 dark:border-gray-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            People you may know
          </p>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No new suggestions at the moment</p>
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending invitations
          </p>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending invitations</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
