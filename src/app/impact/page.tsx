'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImpactEventFeed } from '@/components/impact/ImpactEventFeed';
import { Activity, Star, TrendingUp } from 'lucide-react';

export default function ImpactPage() {
  const [activeTab, setActiveTab] = useState('recent');

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Impact Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          See the real-time impact of charitable giving across the platform
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impact Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries Helped</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,678</div>
            <p className="text-xs text-muted-foreground">Across all causes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Stories</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Verified impact stories</p>
          </CardContent>
        </Card>
      </div>

      {/* Impact Feed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="recent">Recent Impact</TabsTrigger>
          <TabsTrigger value="featured">Featured Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Impact Events</CardTitle>
              <CardDescription>
                Real-time updates showing how donations are making a difference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImpactEventFeed limit={20} showFeatured={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Impact Stories</CardTitle>
              <CardDescription>
                Highlighted stories of verified impact with photos and testimonials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImpactEventFeed limit={10} showFeatured={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Want to create your own impact?</h3>
          <p className="text-muted-foreground mb-6">
            Start a waqf today and see your contributions make a real difference
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/waqf" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background min-h-[44px] bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
              Create Waqf
            </a>
            <a href="/causes" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background min-h-[44px] border border-input hover:bg-accent hover:text-accent-foreground h-11 px-8">
              Browse Causes
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

