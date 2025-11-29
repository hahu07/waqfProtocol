'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { ImpactEvent } from '@/types/impact';
import {
  getRecentImpactEvents,
  getFeaturedImpactEvents,
  formatImpactEventType,
  getImpactEventIcon,
  getImpactEventColor,
} from '@/lib/impact-events';
import { formatCurrency } from '@/utils/formatters';
import { MapPin, Users, CheckCircle, Clock, Image as ImageIcon } from 'lucide-react';

interface ImpactEventFeedProps {
  waqfId?: string;
  causeId?: string;
  limit?: number;
  showFeatured?: boolean;
}

export function ImpactEventFeed({
  waqfId,
  causeId,
  limit = 20,
  showFeatured = false,
}: ImpactEventFeedProps) {
  const [events, setEvents] = useState<ImpactEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [waqfId, causeId, limit, showFeatured]);

  async function loadEvents() {
    setLoading(true);
    try {
      let fetchedEvents: ImpactEvent[];
      
      if (showFeatured) {
        fetchedEvents = await getFeaturedImpactEvents(limit);
      } else {
        fetchedEvents = await getRecentImpactEvents(limit);
      }

      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error loading impact events:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(parseInt(timestamp) / 1_000_000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No impact events yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Impact events will appear here as funds are distributed and projects are completed
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <ImpactEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function ImpactEventCard({ event }: { event: ImpactEvent }) {
  const [showMedia, setShowMedia] = useState(false);
  const color = getImpactEventColor(event.type);
  const icon = getImpactEventIcon(event.type);

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  function formatTimestamp(timestamp: string): string {
    const date = new Date(parseInt(timestamp) / 1_000_000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={colorClasses[color as keyof typeof colorClasses]}>
                {icon}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold line-clamp-2">
                {event.title}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {event.waqfName} → {event.causeName}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <Badge variant="secondary" className="whitespace-nowrap">
              {formatImpactEventType(event.type)}
            </Badge>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground">{event.description}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm font-semibold">
                {formatCurrency(event.amount, event.currency)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Beneficiaries</p>
              <p className="text-sm font-semibold">{event.beneficiaryCount.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-semibold line-clamp-1">
                {event.location.city || event.location.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              {event.verification.status === 'verified' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-semibold capitalize">{event.verification.status}</p>
            </div>
          </div>
        </div>

        {/* Media Preview */}
        {(event.media.photos.length > 0 || event.media.testimonials.length > 0) && (
          <div className="pt-2 border-t">
            <button
              onClick={() => setShowMedia(!showMedia)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ImageIcon className="h-4 w-4" />
              {showMedia ? 'Hide' : 'Show'} media ({event.media.photos.length} photos,{' '}
              {event.media.testimonials.length} testimonials)
            </button>

            {showMedia && (
              <div className="mt-4 space-y-4">
                {/* Photos */}
                {event.media.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {event.media.photos.slice(0, 6).map((photo, idx) => (
                      <div
                        key={idx}
                        className="aspect-video rounded-lg bg-muted overflow-hidden"
                      >
                        <img
                          src={photo}
                          alt={`Impact photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Testimonials */}
                {event.media.testimonials.length > 0 && (
                  <div className="space-y-3">
                    {event.media.testimonials.slice(0, 2).map((testimonial, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted">
                        <p className="text-sm italic">&ldquo;{testimonial.quote}&rdquo;</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          — {testimonial.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

