"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSwitcher } from "@/components/client-switcher";
import { WeeklyCheckin } from "@/components/weekly-checkin";
import { WeightTracker } from "@/components/weight-tracker";
import { CardioGuide } from "@/components/cardio-guide";
import { StrengthGuide } from "@/components/strength-guide";
import { FAQTab } from "@/components/faq-tab";
import { Activity, Dumbbell, Heart, ClipboardCheck, HelpCircle } from "lucide-react";

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
        if (Array.isArray(data)) {
          setClients(data);
          if (data.length > 0) setSelected(data[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle client switch
  const handleClientSelect = useCallback((id: number) => {
    setSelected(id);
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
    <main
      className="min-h-screen pb-16 overflow-x-hidden"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest("input, select, textarea, button, a, [role='button']")) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
    >
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">Ver & Val Fitness</h1>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Personal training tracker</p>
          </div>
          {selected && (
            <ClientSwitcher clients={clients} selected={selected} onSelect={handleClientSelect} />
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs defaultValue="checkin" className="space-y-4 sm:space-y-6">
          <div className="w-full">
            <TabsList className="flex flex-wrap sm:grid sm:grid-cols-5 h-auto gap-1 w-full bg-slate-100/50 p-1 rounded-lg">
              <TabsTrigger value="checkin" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm min-w-[30%]">
                <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Check-in
              </TabsTrigger>
              <TabsTrigger value="weights" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm min-w-[30%]">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Weights
              </TabsTrigger>
              <TabsTrigger value="cardio" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm min-w-[30%]">
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Cardio
              </TabsTrigger>
              <TabsTrigger value="strength" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm min-w-[40%]">
                <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Strength
              </TabsTrigger>
              <TabsTrigger value="faqs" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm min-w-[40%]">
                <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Questions
              </TabsTrigger>
            </TabsList>
          </div>

          {selected && selectedClient && (
            <>
              <TabsContent value="checkin">
                <WeeklyCheckin clientId={selected} clientName={selectedClient.name} color={colorKey} />
              </TabsContent>
              <TabsContent value="weights">
                <WeightTracker clientId={selected} clientName={selectedClient.name} color={colorKey} />
              </TabsContent>
              <TabsContent value="faqs">
                <FAQTab clientName={selectedClient.name} color={colorKey} />
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
