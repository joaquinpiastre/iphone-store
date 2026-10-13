"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Phone } from "@/lib/types";
import { PhoneForm } from "@/components/admin/PhoneForm";
import { PageHeader } from "@/components/admin/ui";

export default function EditPhonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [phone, setPhone] = useState<Phone | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api<{ phone: Phone }>(`/api/admin/phones/${id}`)
      .then((r) => setPhone(r.phone))
      .catch(() => setMissing(true));
  }, [id]);

  return (
    <>
      <PageHeader title="Editar equipo" />
      {missing ? (
        <p className="text-white/50">No se encontró el equipo.</p>
      ) : phone ? (
        <PhoneForm phone={phone} />
      ) : (
        <div className="h-64 animate-pulse rounded-3xl bg-white/5" />
      )}
    </>
  );
}
