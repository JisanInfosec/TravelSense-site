"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import useSWR from "swr";
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, Plus, Trash2, Upload } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AdminDestination, Category, EmergencyContact, Facility, DestinationImage } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABELS, sizedImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormError, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

const DIVISIONS = ["Barishal", "Chattogram", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet"];

interface FormState {
  name: string;
  category: Category;
  district: string;
  division: string;
  address: string;
  latitude: string;
  longitude: string;
  shortDescription: string;
  description: string;
  openingHours: string;
  entryFee: string;
  bestTimeToVisit: string;
  isFeatured: boolean;
  isHiddenGem: boolean;
  isVerified: boolean;
  images: DestinationImage[];
  tips: string;
  warnings: string;
  safetyVerified: boolean;
  facilities: Facility[];
  emergencyContacts: EmergencyContact[];
  website: string;
  websiteLabel: string;
  facebook: string;
  youtube: string;
}

function toState(d?: AdminDestination): FormState {
  return {
    name: d?.name ?? "",
    category: d?.category ?? "BEACH",
    district: d?.district ?? "",
    division: d?.division ?? "Dhaka",
    address: d?.address ?? "",
    latitude: d?.latitude?.toString() ?? "",
    longitude: d?.longitude?.toString() ?? "",
    shortDescription: d?.shortDescription ?? "",
    description: d?.description ?? "",
    openingHours: d?.openingHours ?? "",
    entryFee: d?.entryFee ?? "",
    bestTimeToVisit: d?.bestTimeToVisit ?? "",
    isFeatured: d?.isFeatured ?? false,
    isHiddenGem: d?.isHiddenGem ?? false,
    isVerified: d?.isVerified ?? false,
    images: d?.images.map(({ url, caption, credit, sourceUrl }) => ({ url, caption, credit, sourceUrl })) ?? [],
    tips: d?.safety?.tips.join("\n") ?? "",
    warnings: d?.safety?.warnings.join("\n") ?? "",
    safetyVerified: d?.safety?.isVerified ?? false,
    facilities: d?.facilities.map(({ type, name, address, phone, isVerified }) => ({ type, name, address, phone, isVerified })) ?? [],
    emergencyContacts: d?.emergencyContacts.map(({ label, phone, isVerified }) => ({ label, phone, isVerified })) ?? [],
    website: d?.links?.website ?? "",
    websiteLabel: d?.links?.websiteLabel ?? "",
    facebook: d?.links?.facebook ?? "",
    youtube: d?.links?.youtube ?? "",
  };
}

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export function DestinationForm({ initial }: { initial?: AdminDestination }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<FormState>(() => toState(initial));
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const bind = (k: keyof FormState) => ({
    value: f[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value as never),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const local: string[] = [];
    if (f.name.trim().length < 2) local.push("Name is required.");
    if (!f.district.trim()) local.push("District is required.");
    if (f.shortDescription.trim().length < 10) local.push("Short description must be at least 10 characters.");
    if (f.description.trim().length < 30) local.push("Description must be at least 30 characters.");
    if ((f.latitude === "") !== (f.longitude === "")) local.push("Enter both latitude and longitude, or leave both empty.");
    if (local.length) {
      setErrors(local);
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const body = {
      name: f.name,
      category: f.category,
      district: f.district,
      division: f.division,
      address: f.address,
      latitude: f.latitude === "" ? null : Number(f.latitude),
      longitude: f.longitude === "" ? null : Number(f.longitude),
      shortDescription: f.shortDescription,
      description: f.description,
      openingHours: f.openingHours,
      entryFee: f.entryFee,
      bestTimeToVisit: f.bestTimeToVisit,
      isFeatured: f.isFeatured,
      isHiddenGem: f.isHiddenGem,
      isVerified: f.isVerified,
      images: f.images.filter((i) => i.url.trim()),
      safety: { tips: lines(f.tips), warnings: lines(f.warnings), isVerified: f.safetyVerified },
      facilities: f.facilities.filter((x) => x.name.trim()),
      emergencyContacts: f.emergencyContacts.filter((x) => x.label.trim() && x.phone.trim()),
      links: { website: f.website, websiteLabel: f.websiteLabel, facebook: f.facebook, youtube: f.youtube },
    };

    setSaving(true);
    setErrors([]);
    try {
      const saved = await api<AdminDestination>(initial ? `/admin/destinations/${initial.id}` : "/admin/destinations", {
        method: initial ? "PUT" : "POST",
        body,
      });
      toast(initial ? "Destination updated." : "Destination created.");
      router.push(initial ? "/admin/destinations" : `/admin/destinations/${saved.id}`);
    } catch (err) {
      setErrors(err instanceof ApiError ? (err.details.length ? err.details : [err.message]) : ["Could not save destination."]);
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6 pb-24">
      <div>
        <Link href="/admin/destinations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand">
          <ArrowLeft className="size-4" /> All destinations
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold">{initial ? `Edit ${initial.name}` : "Add a destination"}</h1>
          {initial && (
            <Link href={`/destinations/${initial.slug}`} target="_blank" className="text-sm font-semibold text-brand hover:underline">
              View public page ↗
            </Link>
          )}
        </div>
      </div>

      <div ref={errorRef}>
        {errors.length > 0 && (
          <FormError
            message={errors.length === 1 ? errors[0] : (
              <ul className="list-inside list-disc space-y-0.5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
            )}
          />
        )}
      </div>

      <Section title="Basic information">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="d-name"><Input id="d-name" {...bind("name")} /></Field>
          <Field label="Category" htmlFor="d-cat">
            <Select id="d-cat" {...bind("category")}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </Select>
          </Field>
          <Field label="Short description" htmlFor="d-short" className="sm:col-span-2" hint={`Shown on cards. ${f.shortDescription.length}/240`}>
            <Input id="d-short" maxLength={240} {...bind("shortDescription")} />
          </Field>
          <Field label="Full description" htmlFor="d-desc" className="sm:col-span-2">
            <Textarea id="d-desc" rows={7} {...bind("description")} />
          </Field>
          <div className="flex flex-wrap gap-x-6 gap-y-3 sm:col-span-2">
            <Checkbox label="Featured on home page" checked={f.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
            <Checkbox label="Lesser-known destination (hidden gem)" checked={f.isHiddenGem} onChange={(e) => set("isHiddenGem", e.target.checked)} />
            <Checkbox label="Details verified by the TravelSense team" checked={f.isVerified} onChange={(e) => set("isVerified", e.target.checked)} />
          </div>
        </div>
      </Section>

      <Section title="Location" description="Coordinates power the interactive map and Google Maps navigation.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="District" htmlFor="d-district"><Input id="d-district" {...bind("district")} /></Field>
          <Field label="Division" htmlFor="d-division">
            <Select id="d-division" {...bind("division")}>
              {DIVISIONS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Address" htmlFor="d-address" optional className="sm:col-span-2"><Input id="d-address" {...bind("address")} /></Field>
          <Field label="Latitude" htmlFor="d-lat" optional hint="e.g. 23.7190"><Input id="d-lat" inputMode="decimal" {...bind("latitude")} /></Field>
          <Field label="Longitude" htmlFor="d-lng" optional hint="e.g. 90.3882"><Input id="d-lng" inputMode="decimal" {...bind("longitude")} /></Field>
        </div>
      </Section>

      <Section title="Visitor information" description="Leave a field empty if the information is not known. The site will show “Information not available”.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Opening hours" htmlFor="d-hours" optional><Input id="d-hours" {...bind("openingHours")} /></Field>
          <Field label="Entry fee" htmlFor="d-fee" optional><Input id="d-fee" {...bind("entryFee")} /></Field>
          <Field label="Best time to visit" htmlFor="d-best" optional><Input id="d-best" {...bind("bestTimeToVisit")} /></Field>
        </div>
      </Section>

      <ImagesSection images={f.images} onChange={(v) => set("images", v)} />

      <Section title="Safety information">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Safety tips" htmlFor="d-tips" optional hint="One tip per line.">
            <Textarea id="d-tips" rows={5} {...bind("tips")} />
          </Field>
          <Field label="Warnings" htmlFor="d-warn" optional hint="One warning per line.">
            <Textarea id="d-warn" rows={5} {...bind("warnings")} />
          </Field>
          <div className="sm:col-span-2">
            <Checkbox label="Safety information verified" checked={f.safetyVerified} onChange={(e) => set("safetyVerified", e.target.checked)} />
          </div>
        </div>

        <h3 className="mb-3 mt-8 font-sans text-sm font-bold uppercase tracking-wider text-muted">Nearby hospitals &amp; police stations</h3>
        <Repeater
          items={f.facilities}
          onChange={(v) => set("facilities", v)}
          create={(): Facility => ({ type: "HOSPITAL", name: "", address: "", phone: "", isVerified: false })}
          addLabel="Add facility"
          render={(x, upd) => (
            <div className="grid flex-1 gap-3 sm:grid-cols-[10rem_1fr_1fr_9rem]">
              <Select aria-label="Type" value={x.type} onChange={(e) => upd({ ...x, type: e.target.value as Facility["type"] })}>
                <option value="HOSPITAL">Hospital</option>
                <option value="POLICE_STATION">Police station</option>
              </Select>
              <Input aria-label="Name" placeholder="Name" value={x.name} onChange={(e) => upd({ ...x, name: e.target.value })} />
              <Input aria-label="Address" placeholder="Address (optional)" value={x.address ?? ""} onChange={(e) => upd({ ...x, address: e.target.value })} />
              <Input aria-label="Phone" placeholder="Phone (optional)" value={x.phone ?? ""} onChange={(e) => upd({ ...x, phone: e.target.value })} />
              <div className="sm:col-span-4">
                <Checkbox label="Verified" checked={!!x.isVerified} onChange={(e) => upd({ ...x, isVerified: e.target.checked })} />
              </div>
            </div>
          )}
        />

        <h3 className="mb-3 mt-8 font-sans text-sm font-bold uppercase tracking-wider text-muted">Emergency contacts</h3>
        <Repeater
          items={f.emergencyContacts}
          onChange={(v) => set("emergencyContacts", v)}
          create={() => ({ label: "", phone: "", isVerified: false })}
          addLabel="Add emergency contact"
          render={(x, upd) => (
            <div className="grid flex-1 items-center gap-3 sm:grid-cols-[1fr_10rem_auto]">
              <Input aria-label="Label" placeholder="e.g. National Emergency Service" value={x.label} onChange={(e) => upd({ ...x, label: e.target.value })} />
              <Input aria-label="Phone" placeholder="Phone" value={x.phone} onChange={(e) => upd({ ...x, phone: e.target.value })} />
              <Checkbox label="Verified" checked={!!x.isVerified} onChange={(e) => upd({ ...x, isVerified: e.target.checked })} />
            </div>
          )}
        />
      </Section>

      <Section title="External links" description="Only add official accounts. Leave empty if none exist.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Official website" htmlFor="d-web" optional><Input id="d-web" placeholder="https://" {...bind("website")} /></Field>
          <Field label="Website label" htmlFor="d-webl" optional hint="e.g. “Department of Archaeology (managing authority)”"><Input id="d-webl" {...bind("websiteLabel")} /></Field>
          <Field label="Facebook page" htmlFor="d-fb" optional><Input id="d-fb" placeholder="https://facebook.com/…" {...bind("facebook")} /></Field>
          <Field label="YouTube" htmlFor="d-yt" optional><Input id="d-yt" placeholder="https://youtube.com/…" {...bind("youtube")} /></Field>
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur">
        <div className="container-page flex items-center justify-end gap-3 py-3">
          <Link href="/admin/destinations" className="text-sm font-semibold text-muted hover:text-ink">Cancel</Link>
          <Button type="submit" loading={saving}>{initial ? "Save changes" : "Create destination"}</Button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-sans text-lg font-bold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Repeater<T>({
  items,
  onChange,
  create,
  render,
  addLabel,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  create: () => T;
  render: (item: T, update: (v: T) => void) => React.ReactNode;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 rounded-2xl border border-line bg-canvas/50 p-3">
          {render(item, (v) => onChange(items.map((x, j) => (j === i ? v : x))))}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"
            aria-label="Remove"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, create()])}>
        <Plus className="size-4" /> {addLabel}
      </Button>
    </div>
  );
}

function ImagesSection({ images, onChange }: { images: DestinationImage[]; onChange: (v: DestinationImage[]) => void }) {
  const toast = useToast();
  const { data: cfg } = useSWR<{ enabled: boolean; maxBytes: number }>("/admin/uploads/config");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const move = (i: number, dir: -1 | 1) => {
    const next = [...images];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  const upload = async (file: File) => {
    if (cfg && file.size > cfg.maxBytes) return toast("Image is larger than 5 MB.", "error");
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const res = await api<{ url: string }>("/admin/uploads", { method: "POST", body: form });
      onChange([...images, { url: res.url, caption: "", credit: "" }]);
      toast("Image uploaded.");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Section title="Photos" description="The first photo is used as the cover. Images are stored in the image service; only their URLs are saved.">
      <div className="space-y-3">
        {images.map((img, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-line bg-canvas/50 p-3 sm:flex-row">
            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-leaf sm:w-40">
              {img.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sizedImage(img.url, 330)} alt="" className="size-full object-cover" />
              )}
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">Cover</span>}
            </div>
            <div className="grid flex-1 gap-2">
              <Input aria-label="Image URL" placeholder="https://…" value={img.url} onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
              <div className="grid gap-2 sm:grid-cols-2">
                <Input aria-label="Caption" placeholder="Caption (optional)" value={img.caption ?? ""} onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} />
                <Input aria-label="Credit" placeholder="Photo credit / licence (optional)" value={img.credit ?? ""} onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, credit: e.target.value } : x)))} />
              </div>
            </div>
            <div className="flex gap-1 sm:flex-col">
              <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></IconBtn>
              <IconBtn label="Move down" disabled={i === images.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></IconBtn>
              <IconBtn label="Remove image" danger onClick={() => onChange(images.filter((_, j) => j !== i))}><Trash2 className="size-4" /></IconBtn>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...images, { url: "", caption: "", credit: "" }])}>
            <ImagePlus className="size-4" /> Add image URL
          </Button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button type="button" variant="secondary" size="sm" disabled={!cfg?.enabled} loading={uploading} onClick={() => fileRef.current?.click()}>
            {!uploading && <Upload className="size-4" />} Upload image
          </Button>
          {cfg && !cfg.enabled && <span className="text-xs text-muted">Uploads are disabled until Cloudinary is configured on the server.</span>}
        </div>
      </div>
    </Section>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`grid size-9 place-items-center rounded-full text-muted transition disabled:opacity-30 ${danger ? "hover:bg-danger-soft hover:text-danger" : "hover:bg-leaf-soft hover:text-ink"}`}
    >
      {children}
    </button>
  );
}
