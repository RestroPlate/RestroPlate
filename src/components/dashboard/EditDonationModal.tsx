import { useState, type FormEvent } from "react";
import type { Donation, UpdateDonationPayload } from "../../types/Dashboard";

interface EditDonationModalProps {
    donation: Donation;
    onSave: (id: number, payload: UpdateDonationPayload) => Promise<void>;
    onClose: () => void;
}

interface EditFormState {
    foodType: string;
    quantity: string;
    unit: string;
    expirationDate: string;
    pickupAddress: string;
    availabilityTime: string;
}

type FormErrors = Partial<Record<keyof EditFormState, string>>;

function toDateInputValue(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toISOString().split("T")[0];
}

function validateEditForm(values: EditFormState): FormErrors {
    const errors: FormErrors = {};
    const quantity = Number(values.quantity);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!values.foodType.trim()) errors.foodType = "Food type is required.";
    if (!values.unit.trim()) errors.unit = "Unit is required.";
    if (!values.expirationDate) {
        errors.expirationDate = "Expiration date is required.";
    } else {
        const expiration = new Date(`${values.expirationDate}T00:00:00`);
        if (Number.isNaN(expiration.getTime()) || expiration < today) {
            errors.expirationDate = "Expiration date must be today or later.";
        }
    }
    if (!values.pickupAddress.trim()) errors.pickupAddress = "Pickup address is required.";
    if (!values.availabilityTime) errors.availabilityTime = "Availability time is required.";
    if (!values.quantity.trim()) {
        errors.quantity = "Quantity is required.";
    } else if (!Number.isFinite(quantity) || quantity <= 0) {
        errors.quantity = "Quantity must be greater than 0.";
    }

    return errors;
}

const INPUT_CLASS =
    "w-full rounded-lg border border-white/15 bg-[#111F0F] px-3 py-2 text-sm text-[#F0EBE1] outline-none transition focus:border-[#7DC542]";
const LABEL_CLASS =
    "mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#F0EBE1]/70";

export default function EditDonationModal({ donation, onSave, onClose }: EditDonationModalProps) {
    const [form, setForm] = useState<EditFormState>({
        foodType: donation.food_type,
        quantity: String(donation.quantity),
        unit: donation.unit,
        expirationDate: toDateInputValue(donation.expiry_date),
        pickupAddress: donation.pickup_location,
        availabilityTime: donation.availability_time,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    function handleFieldChange(field: keyof EditFormState, value: string): void {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setSaveError(null);

        const nextErrors = validateEditForm(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setSaving(true);
        try {
            await onSave(donation.donation_id, {
                foodType: form.foodType.trim(),
                quantity: Number(form.quantity),
                unit: form.unit.trim(),
                expirationDate: form.expirationDate,
                pickupAddress: form.pickupAddress.trim(),
                availabilityTime: form.availabilityTime,
            });
            onClose();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to update donation.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0F1D0C] p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#F0EBE1]">Edit Donation</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-[#F0EBE1]/50 transition hover:bg-white/10 hover:text-[#F0EBE1]"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {saveError ? (
                    <div className="mb-4 rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100" role="alert">
                        {saveError}
                    </div>
                ) : null}

                <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label htmlFor="edit-foodType" className={LABEL_CLASS}>Food Type</label>
                        <input id="edit-foodType" type="text" value={form.foodType} onChange={(e) => handleFieldChange("foodType", e.target.value)} className={INPUT_CLASS} />
                        {errors.foodType ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.foodType}</p> : null}
                    </div>

                    <div>
                        <label htmlFor="edit-quantity" className={LABEL_CLASS}>Quantity</label>
                        <input id="edit-quantity" type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => handleFieldChange("quantity", e.target.value)} className={INPUT_CLASS} />
                        {errors.quantity ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.quantity}</p> : null}
                    </div>

                    <div>
                        <label htmlFor="edit-unit" className={LABEL_CLASS}>Unit</label>
                        <input id="edit-unit" type="text" value={form.unit} onChange={(e) => handleFieldChange("unit", e.target.value)} className={INPUT_CLASS} />
                        {errors.unit ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.unit}</p> : null}
                    </div>

                    <div>
                        <label htmlFor="edit-expirationDate" className={LABEL_CLASS}>Expiration Date</label>
                        <input id="edit-expirationDate" type="date" value={form.expirationDate} onChange={(e) => handleFieldChange("expirationDate", e.target.value)} className={INPUT_CLASS} />
                        {errors.expirationDate ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.expirationDate}</p> : null}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="edit-pickupAddress" className={LABEL_CLASS}>Pickup Address</label>
                        <input id="edit-pickupAddress" type="text" value={form.pickupAddress} onChange={(e) => handleFieldChange("pickupAddress", e.target.value)} className={INPUT_CLASS} />
                        {errors.pickupAddress ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.pickupAddress}</p> : null}
                    </div>

                    <div>
                        <label htmlFor="edit-availabilityTime" className={LABEL_CLASS}>Availability Time</label>
                        <input id="edit-availabilityTime" type="time" value={form.availabilityTime} onChange={(e) => handleFieldChange("availabilityTime", e.target.value)} className={INPUT_CLASS} />
                        {errors.availabilityTime ? <p className="mt-1 text-xs font-semibold text-rose-300">{errors.availabilityTime}</p> : null}
                    </div>

                    <div className="flex items-end gap-3 md:col-span-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center rounded-lg bg-[#7DC542] px-6 py-2.5 text-sm font-extrabold text-[#0B1A08] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(125,197,66,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "SAVING..." : "SAVE CHANGES"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-bold text-[#F0EBE1]/70 transition hover:bg-white/5"
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
