"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "../../hooks/useAuth";
import { MapPin, Users, Search, Plus, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function EventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canCreateEvent = user?.role === "employer" || user?.role === "alumni";

  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [myCreatedEvents, setMyCreatedEvents] = useState<any[]>([]);
  const [myRegisteredEvents, setMyRegisteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/events/all");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch events");
      setEvents(data.events);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchEvents();
  }, [user]);

  useEffect(() => {
    if (!user || events.length === 0) return;
    setFilteredEvents(
      events.filter(
        (event) =>
          event.createdBy !== user._id &&
          event.title.toLowerCase().startsWith(searchQuery.toLowerCase())
      )
    );
    setMyCreatedEvents(events.filter((event) => event.createdBy === user._id));
    setMyRegisteredEvents(
      events.filter((event) => event.registeredUsers?.includes(user._id))
    );
  }, [user, events, searchQuery]);

  const registerEvent = async (event: any) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/events/register/${event._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user._id }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register");
      alert("Successfully registered!");
      fetchEvents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePay = (event: any) => {
    alert(`Proceeding to payment for event: ${event.title}`);
  };

  const toggleExpand = (section: string, eventId: string) => {
    const key = `${section}-${eventId}`;
    setExpandedEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderEventsGrid = (
    eventList: any[],
    section: string,
    options: { showRSVP?: boolean; onlyDetails?: boolean } = {}
  ) => {
    const { showRSVP = true, onlyDetails = false } = options;

    if (eventList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          <p className="text-sm">No events found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {eventList.map((event) => {
          const key = `${section}-${event._id}`;
          const isExpanded = expandedEvents[key] || false;
          const isCreatedByUser = event.createdBy === user._id;

          return (
            <Card key={event._id} className="overflow-hidden border border-gray-200">
              <div className="bg-gray-100 h-32 relative">
                <div className="absolute top-2 left-2 bg-white rounded px-2 py-1 text-xs font-medium">
                  {event.month ||
                    new Date(event.date).toLocaleString("en-US", { month: "short" })}{" "}
                  {event.date ? new Date(event.date).getDate() : ""}
                </div>
                {event.posterUrl && (
                  <img
                    src={event.posterUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <CardContent className="p-3">
                <h3 className="font-medium text-sm mb-2 text-gray-900">{event.title}</h3>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{event.mode === "offline" ? event.venue : "Online Event"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{event.registeredUsers?.length || 0} going</span>
                    </div>
                    {event.donationAccepted && (
                      <span className="text-green-600 font-medium">Donation Accepted</span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mb-3 text-xs text-gray-700">
                    <p>{event.description}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-7 border-gray-300 flex items-center justify-center gap-1"
                    onClick={() => toggleExpand(section, event._id)}
                  >
                    {isExpanded ? (
                      <>
                        Show Less <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Details <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </Button>

                  {!onlyDetails && (
                    <>
                      {showRSVP && (
                        <Button
                          size="sm"
                          className="flex-1 text-xs h-7 bg-primary hover:bg-primary/90"
                          onClick={() => registerEvent(event)}
                        >
                          Register
                        </Button>
                      )}
                      {event.donationAccepted && !isCreatedByUser && (
                        <Button
                          size="sm"
                          className="flex-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                          onClick={() => handlePay(event)}
                        >
                          Pay
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 ml-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">Discover and join alumni events</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" size="sm" className="border-gray-300">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          {canCreateEvent && (
            <Button
              className="bg-primary hover:bg-primary/90"
              size="sm"
              onClick={() => router.push("/dashboard/events/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        renderEventsGrid(filteredEvents, "all", { showRSVP: true })
      )}

      <div className="mt-16 border-t pt-8">
        {user?.role === "student" ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Registered Events</h2>
            {renderEventsGrid(myRegisteredEvents, "registered", { onlyDetails: true })}
          </div>
        ) : (
          <Tabs defaultValue="created" className="w-full">
            <TabsList className="flex w-full border-b border-gray-200">
              <TabsTrigger
                value="created"
                className="flex-1 px-4 py-2 text-sm font-large text-gray-600 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                My Events
              </TabsTrigger>
              <TabsTrigger
                value="registered"
                className="flex-1 px-4 py-2 text-sm font-large text-gray-600 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                My Registered Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="created" className="mt-6">
              {renderEventsGrid(myCreatedEvents, "created", { showRSVP: false })}
            </TabsContent>

            <TabsContent value="registered" className="mt-6">
              {renderEventsGrid(myRegisteredEvents, "registered", { onlyDetails: true })}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
