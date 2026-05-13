"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientSwitcher } from "@/components/client-switcher";
import { WeeklyCheckin } from "@/components/weekly-checkin";
import { WeightTracker } from "@/components/weight-tracker";
import { CardioGuide } from "@/components/cardio-guide";
import { StrengthGuide } from "@/components/strength-guide";
import { ToastNotification } from "@/components/toast-notification";
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
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"ver" | "val">("ver");
  const [showToast, setShowToast] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

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

  // Show toast on initial load
  useEffect(() => {
    if (!loading && selected && !initialLoadDone) {
      const client = clients.find((c) => c.id === selected);
      if (client) {
        const color: "ver" | "val" = client.name === "Val" ? "val" : "ver";
        setToastColor(color);
        setToastMessage(`You're viewing ${client.name}'s dashboard`);
        setShowToast(true);
        setInitialLoadDone(true);
      }
    }
  }, [loading, selected, clients, initialLoadDone]);

  // Handle client switch
  const handleClientSelect = useCallback((id: number) => {
    setSelected(id);
    const client = clients.find((c) => c.id === id);
    if (client) {
      const color: "ver" | "val" = client.name === "Val" ? "val" : "ver";
      setToastColor(color);
      setToastMessage(`Switched to ${client.name}'s dashboard`);
      setShowToast(true);
    }
  }, [clients]);

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
      {/* Toast notification */}
      <ToastNotification
        message={toastMessage}
        color={toastColor}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

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
          <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
            <TabsList className="inline-flex sm:grid sm:w-full sm:grid-cols-5 h-auto gap-1">
              <TabsTrigger value="checkin" className="flex-shrink-0 flex items-center gap-1.5 py-2 sm:py-2.5 text-xs sm:text-sm min-w-[90px]">
                <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Check-in
              </TabsTrigger>
              <TabsTrigger value="weights" className="flex-shrink-0 flex items-center gap-1.5 py-2 sm:py-2.5 text-xs sm:text-sm min-w-[90px]">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Weights
              </TabsTrigger>
              <TabsTrigger value="cardio" className="flex-shrink-0 flex items-center gap-1.5 py-2 sm:py-2.5 text-xs sm:text-sm min-w-[90px]">
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Cardio
              </TabsTrigger>
              <TabsTrigger value="strength" className="flex-shrink-0 flex items-center gap-1.5 py-2 sm:py-2.5 text-xs sm:text-sm min-w-[90px]">
                <Dumbbell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Strength
              </TabsTrigger>
              <TabsTrigger value="faqs" className="flex-shrink-0 flex items-center gap-1.5 py-2 sm:py-2.5 text-xs sm:text-sm min-w-[90px]">
                <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                FAQs
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
