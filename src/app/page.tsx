"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSwitcher } from "@/components/client-switcher";
import { WeeklyCheckin } from "@/components/weekly-checkin";
import { WeightTracker } from "@/components/weight-tracker";
import { CardioGuide } from "@/components/cardio-guide";
import { StrengthGuide } from "@/components/strength-guide";
import { Activity, Dumbbell, Heart, ClipboardCheck } from "lucide-react";

interface Client {
  id: number;
  name: string;
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data: Client[]) => {
        setClients(data);
        if (data.length > 0) setSelected(data[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedClient = clients.find((c) => c.id === selected);
  const colorKey: "ver" | "val" = selectedClient?.name === "Val" ? "val" : "ver";

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ver & Val Fitness</h1>
            <p className="text-sm text-slate-500">Personal training tracker</p>
          </div>
          {selected && (
            <ClientSwitcher clients={clients} selected={selected} onSelect={setSelected} />
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="checkin" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="checkin" className="flex items-center gap-1.5 py-2.5">
              <ClipboardCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Weekly</span> Check-in
            </TabsTrigger>
            <TabsTrigger value="weights" className="flex items-center gap-1.5 py-2.5">
              <Activity className="h-4 w-4" />
              Weight Tracker
            </TabsTrigger>
            <TabsTrigger value="cardio" className="flex items-center gap-1.5 py-2.5">
              <Heart className="h-4 w-4" />
              Cardio Guide
            </TabsTrigger>
            <TabsTrigger value="strength" className="flex items-center gap-1.5 py-2.5">
              <Dumbbell className="h-4 w-4" />
              Strength Guide
            </TabsTrigger>
          </TabsList>

          {selected && selectedClient && (
            <>
              <TabsContent value="checkin">
                <WeeklyCheckin clientId={selected} clientName={selectedClient.name} color={colorKey} />
              </TabsContent>
              <TabsContent value="weights">
                <WeightTracker clientId={selected} clientName={selectedClient.name} color={colorKey} />
              </TabsContent>
            </>
          )}
          <TabsContent value="cardio">
            <CardioGuide />
          </TabsContent>
          <TabsContent value="strength">
            <StrengthGuide />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
