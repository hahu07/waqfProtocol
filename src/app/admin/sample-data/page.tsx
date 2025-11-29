'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import {
  createSampleImpactEvents,
  createFeaturedEvent,
  generateSampleEvent,
} from '@/scripts/create-sample-impact-events';
import { createImpactEvent } from '@/lib/impact-events';

export default function SampleDataPage() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(10);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  async function handleCreateSampleEvents() {
    setLoading(true);
    setResult(null);

    try {
      const events = await createSampleImpactEvents(count);
      setResult({
        type: 'success',
        message: `Successfully created ${events.length} sample impact events!`,
      });
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create sample events',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFeaturedEvent() {
    setLoading(true);
    setResult(null);

    try {
      const result = await createFeaturedEvent();
      if (result.success) {
        setResult({
          type: 'success',
          message: `Successfully created featured event: ${result.event?.title}`,
        });
      } else {
        setResult({
          type: 'error',
          message: result.error || 'Failed to create featured event',
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create featured event',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSingleEvent() {
    setLoading(true);
    setResult(null);

    try {
      const eventData = generateSampleEvent();
      const result = await createImpactEvent(eventData);
      
      if (result.success) {
        setResult({
          type: 'success',
          message: `Successfully created: ${result.event?.title}`,
        });
      } else {
        setResult({
          type: 'error',
          message: result.error || 'Failed to create event',
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create event',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Sample Data Generator</h1>
        <p className="text-muted-foreground text-lg">
          Create sample impact events for testing and demonstration
        </p>
      </div>

      <div className="space-y-6">
        {/* Create Multiple Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create Multiple Sample Events
            </CardTitle>
            <CardDescription>
              Generate random impact events with photos and testimonials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count">Number of Events</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 10)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Create between 1 and 50 sample events
              </p>
            </div>

            <Button
              onClick={handleCreateSampleEvents}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating {count} events...
                </>
              ) : (
                <>Create {count} Sample Events</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Create Featured Event */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ Create Featured Event
            </CardTitle>
            <CardDescription>
              Create a high-quality featured event with complete details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateFeaturedEvent}
              disabled={loading}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating featured event...
                </>
              ) : (
                <>Create Featured Event</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Create Single Random Event */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎲 Create Single Random Event
            </CardTitle>
            <CardDescription>
              Generate one random impact event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateSingleEvent}
              disabled={loading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating event...
                </>
              ) : (
                <>Create Random Event</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Alert */}
        {result && (
          <Alert variant={result.type === 'success' ? 'default' : 'destructive'}>
            {result.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">📝 Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1. Create Sample Events:</strong> Generate multiple random impact events
              with various types, locations, and media.
            </p>
            <p>
              <strong>2. Create Featured Event:</strong> Generate a high-quality featured event
              about a school opening in Kenya.
            </p>
            <p>
              <strong>3. View Results:</strong> After creating events, visit the{' '}
              <a href="/impact" className="text-primary hover:underline">
                Impact Dashboard
              </a>{' '}
              to see them.
            </p>
            <p className="text-muted-foreground mt-4">
              <strong>Note:</strong> Make sure the <code>impact_events</code> collection exists
              in your Juno console before creating events.
            </p>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="flex gap-4">
          <Button variant="outline" asChild className="flex-1">
            <a href="/impact">View Impact Dashboard</a>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <a href="https://console.juno.build" target="_blank" rel="noopener noreferrer">
              Open Juno Console
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

