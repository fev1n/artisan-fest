import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, UploadCloud, Info, AlertCircle, Loader2, X, ImageIcon, ArrowLeft, Palette, UtensilsCrossed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const photoRules = z
  .any()
  .refine((files) => files?.length >= 3, "Please upload at least 3 photos")
  .refine((files) => {
    if (!files) return false;
    for (let i = 0; i < files.length; i++) if (files[i].size > MAX_FILE_SIZE) return false;
    return true;
  }, "Max file size per photo is 10MB.")
  .refine((files) => {
    if (!files) return false;
    for (let i = 0; i < files.length; i++) if (!ACCEPTED_IMAGE_TYPES.includes(files[i].type)) return false;
    return true;
  }, "Only .jpg, .jpeg, .png and .webp formats are supported.");

const logoRules = z
  .any()
  .optional()
  .refine((files) => { if (!files || files.length === 0) return true; return files[0]?.size <= MAX_FILE_SIZE; }, "Max file size is 10MB.")
  .refine((files) => { if (!files || files.length === 0) return true; return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type); }, "Only .jpg, .jpeg, .png and .webp formats are supported.");

// ── Schemas ───────────────────────────────────────────────────────────────────

const artisanSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  businessName: z.string().optional(),
  streetAddress: z.string().min(1, "Street Address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal Code is required"),
  phoneNumber: z.string().min(1, "Phone Number is required"),
  emailAddress: z.string().email("Invalid email address"),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  onlineStore: z.string().optional(),
  otherSocialMedia: z.string().optional(),
  productCategories: z.array(z.string()).min(1, "Please select at least one product category"),
  productDescription: z.string().min(1, "Please describe your products"),
  artistBio: z.string().min(1, "Artist bio is required"),
  isArtisanFoodVendor: z.enum(["yes", "no"], { required_error: "Please specify if you are an artisan food vendor" }),
  logo: logoRules,
  photos: photoRules,
  grantPromoPermission: z.boolean().refine((val) => val === true, { message: "You must grant permission to proceed" }),
  agreeToTerms: z.boolean().refine((val) => val === true, { message: "You must agree to the terms to proceed" }),
});

const foodSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  businessName: z.string().optional(),
  phoneNumber: z.string().min(1, "Phone Number is required"),
  emailAddress: z.string().email("Invalid email address"),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  foodDescription: z.string().min(1, "Please describe your food products"),
  setupType: z.enum(["truck", "tent"], { required_error: "Please select your setup type" }),
  logo: logoRules,
  photos: photoRules,
  grantPromoPermission: z.boolean().refine((val) => val === true, { message: "You must grant permission to proceed" }),
  agreeToTerms: z.boolean().refine((val) => val === true, { message: "You must agree to the terms to proceed" }),
});

type ArtisanFormValues = z.infer<typeof artisanSchema>;
type FoodFormValues = z.infer<typeof foodSchema>;

const PRODUCT_CATEGORIES = [
  "Original Art", "Handmade Jewelry", "Ceramics", "Textiles",
  "Woodwork", "Artisan Food", "Candles", "Other",
];

// ── Terms Panels ──────────────────────────────────────────────────────────────

function ArtisanTermsPanel() {
  return (
    <div className="space-y-6 text-foreground/90">
      <Card className="border-none shadow-sm bg-card/60">
        <CardContent className="p-6 space-y-7">
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" /> Vendor Eligibility
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Only handmade artisan products, original artwork, and artisan baked goods are permitted.</li>
              <li>Resale, retail, and factory-produced items are not allowed.</li>
              <li>This market is curated, with selection based on craftsmanship, originality, and product quality.</li>
              <li>Vendors must list all product categories they intend to sell in their application.</li>
              <li>Only approved products may be displayed and sold at the event.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Booth Space & Vendor Setup</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Each vendor will be provided with a 12' × 12' outdoor space to set up their booth.</li>
              <li>Vendors are responsible for bringing all equipment required for their booth setup that fits within their assigned space.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Application & Selection Process</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Accepted vendors will receive a confirmation email with payment instructions and next steps.</li>
              <li>Submission of an application does not guarantee acceptance.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Booth Fees & Payment Policy</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Vendor Fee: $100 + HST</li>
              <li>Booth space is not confirmed until payment is received in full</li>
              <li>Booth fees are non-refundable</li>
              <li>The event will proceed rain or shine</li>
              <li>
                For questions:{" "}
                <a href="mailto:art@saugaartisanfest.ca" className="text-accent hover:text-primary transition-colors font-semibold underline underline-offset-2">
                  art@saugaartisanfest.ca
                </a>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

function FoodTermsPanel() {
  return (
    <div className="space-y-6 text-foreground/90">
      <Card className="border-none shadow-sm bg-card/60">
        <CardContent className="p-6 space-y-7">
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" /> Vendor Eligibility
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>All food items must be made from scratch. Resale of commercially produced food is not permitted.</li>
              <li>Food must be prepared in a licensed commercial kitchen or an approved facility.</li>
              <li>Vendors must hold a valid food handler certificate.</li>
              <li>All food vendors must comply with Peel Public Health requirements.</li>
              <li>This market is curated — selection is based on product quality and originality.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Booth Space & Setup</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Tent vendors will be assigned a 10' × 10' outdoor booth space.</li>
              <li>Food trucks will be accommodated in designated areas of the festival grounds.</li>
              <li>Vendors are responsible for all equipment, supplies, and waste disposal within their space.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Application & Selection Process</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Accepted vendors will receive a confirmation email with payment instructions and next steps.</li>
              <li>Submission of an application does not guarantee acceptance.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Booth Fees & Payment Policy</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Vendor Fee: $175 + HST</li>
              <li>Booth space is not confirmed until payment is received in full</li>
              <li>Booth fees are non-refundable</li>
              <li>The event will proceed rain or shine</li>
              <li>
                For questions:{" "}
                <a href="mailto:art@saugaartisanfest.ca" className="text-accent hover:text-primary transition-colors font-semibold underline underline-offset-2">
                  art@saugaartisanfest.ca
                </a>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Shared: Success Screen ────────────────────────────────────────────────────

function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl text-center p-8 sm:p-12 border-primary/20 shadow-lg bg-card text-card-foreground">
        <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-sans font-bold mb-4 text-foreground">Thank You!</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Your application for the Sauga Artisan Festival has been successfully submitted.
          You will receive a confirmation email shortly with further details and next steps.
        </p>
        <Button
          size="lg"
          onClick={onReset}
          className="font-semibold bg-primary hover:bg-secondary hover:text-secondary-foreground text-primary-foreground transition-colors"
          data-testid="button-submit-another"
        >
          Submit Another Application
        </Button>
      </Card>
    </div>
  );
}

// ── Shared: Photo Upload ──────────────────────────────────────────────────────

function PhotoUploadField({ form, selectedPhotos, photoInputRef, onAdd, onRemove }: {
  form: ReturnType<typeof useForm<any>>;
  selectedPhotos: File[];
  photoInputRef: React.RefObject<HTMLInputElement | null>;
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <FormField
      control={form.control}
      name="photos"
      render={() => (
        <FormItem>
          <FormLabel className="text-base font-semibold">
            Upload at least 3 recent photos of the products / food you intend to sell <span className="text-destructive">*</span>
          </FormLabel>
          <FormDescription>(These images may be used for promotional purposes if your application is accepted)</FormDescription>
          <FormControl>
            <div className="space-y-3">
              <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onAdd} data-testid="input-file-photos" />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-primary/40 bg-primary/5 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                {selectedPhotos.length === 0 ? "Choose photos" : "Add more photos"}
              </button>
              {selectedPhotos.length > 0 && (
                <ul className="space-y-2">
                  {selectedPhotos.map((file, i) => (
                    <li key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/60 border border-border text-sm">
                      <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate flex-1 text-foreground/80">{file.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button type="button" onClick={() => onRemove(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove photo">
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">{selectedPhotos.length} / 3 minimum selected · JPG, PNG, WebP · Max 10MB each</p>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ── Artisan Vendor Form ───────────────────────────────────────────────────────

function ArtisanForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ArtisanFormValues>({
    resolver: zodResolver(artisanSchema),
    defaultValues: {
      firstName: "", lastName: "", businessName: "", streetAddress: "", city: "",
      province: "", postalCode: "", phoneNumber: "", emailAddress: "", website: "",
      instagram: "", facebook: "", onlineStore: "", otherSocialMedia: "",
      productCategories: [], productDescription: "", artistBio: "",
      isArtisanFoodVendor: undefined, grantPromoPermission: false, agreeToTerms: false,
    },
  });

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;
    const updated = [...selectedPhotos, ...newFiles];
    setSelectedPhotos(updated);
    form.setValue("photos", updated, { shouldValidate: true });
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handlePhotoRemove = (index: number) => {
    const updated = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(updated);
    form.setValue("photos", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: ArtisanFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("applicantType", "artisan");
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      if (data.businessName) formData.append("businessName", data.businessName);
      formData.append("streetAddress", data.streetAddress);
      formData.append("city", data.city);
      formData.append("province", data.province);
      formData.append("postalCode", data.postalCode);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("emailAddress", data.emailAddress);
      if (data.website) formData.append("website", data.website);
      if (data.instagram) formData.append("instagram", data.instagram);
      if (data.facebook) formData.append("facebook", data.facebook);
      if (data.onlineStore) formData.append("onlineStore", data.onlineStore);
      if (data.otherSocialMedia) formData.append("otherSocialMedia", data.otherSocialMedia);
      formData.append("productCategories", data.productCategories.join(", "));
      formData.append("productDescription", data.productDescription);
      formData.append("artistBio", data.artistBio);
      formData.append("isArtisanFoodVendor", data.isArtisanFoodVendor);
      formData.append("grantPromoPermission", data.grantPromoPermission ? "true" : "false");
      formData.append("agreeToTerms", data.agreeToTerms ? "true" : "false");
      if (data.logo && data.logo.length > 0) formData.append("logo", data.logo[0]);
      if (data.photos && data.photos.length > 0) {
        for (let i = 0; i < data.photos.length; i++) formData.append("photos", data.photos[i]);
      }

      const response = await fetch("/api/applications", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to submit application");
      onSuccess();
      toast({ title: "Application Submitted Successfully", description: "We have received your application." });
    } catch {
      toast({ variant: "destructive", title: "Submission Error", description: "There was an error submitting your application. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-xl bg-card">
      <CardContent className="p-6 md:p-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

            {/* Applicant Information */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Applicant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">First Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Jane" {...field} className="bg-background" data-testid="input-first-name" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Last Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Doe" {...field} className="bg-background" data-testid="input-last-name" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="businessName" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel className="text-base">Business Name (if applicable)</FormLabel>
                    <FormControl><Input placeholder="Jane's Art Studio" {...field} className="bg-background" data-testid="input-business-name" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
              </div>
            </section>

            {/* Contact Information */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="streetAddress" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel className="text-base">Street Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="123 Artisan Way" {...field} className="bg-background" data-testid="input-street-address" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">City <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Mississauga" {...field} className="bg-background" data-testid="input-city" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="province" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Province <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="ON" {...field} className="bg-background" data-testid="input-province" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="postalCode" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Postal Code <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="L5B 2C9" {...field} className="bg-background" data-testid="input-postal-code" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Phone Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} className="bg-background" data-testid="input-phone-number" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="emailAddress" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel className="text-base">Email Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="email" placeholder="jane@example.com" {...field} className="bg-background" data-testid="input-email-address" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
              </div>
            </section>

            {/* Online Presence */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Online Presence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Website (if available)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} className="bg-background" data-testid="input-website" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="instagram" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Instagram</FormLabel>
                    <FormControl><Input placeholder="@handle" {...field} className="bg-background" data-testid="input-instagram" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="facebook" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Facebook</FormLabel>
                    <FormControl><Input placeholder="Page Name or URL" {...field} className="bg-background" data-testid="input-facebook" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="onlineStore" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Online Store / E-commerce Link</FormLabel>
                    <FormDescription>If different from website</FormDescription>
                    <FormControl><Input placeholder="Etsy, Shopify, etc." {...field} className="bg-background" data-testid="input-online-store" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="otherSocialMedia" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel className="text-base">Other Social Media Links</FormLabel>
                    <FormControl><Input placeholder="TikTok, Pinterest, etc." {...field} className="bg-background" data-testid="input-other-social" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
              </div>
            </section>

            {/* Vendor Details */}
            <section className="space-y-8">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Vendor Details</h3>
              <FormField control={form.control} name="productCategories" render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base font-semibold">Product Category (select all that apply) <span className="text-destructive">*</span></FormLabel>
                    <FormDescription>(Examples: Original Art, Handmade Jewelry, Ceramics, Textiles, Woodwork, Artisan Food, Candles, etc.)</FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRODUCT_CATEGORIES.map((item) => (
                      <FormField key={item} control={form.control} name="productCategories" render={({ field }) => (
                        <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/5 transition-colors cursor-pointer">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => checked ? field.onChange([...field.value, item]) : field.onChange(field.value?.filter((v) => v !== item))}
                              data-testid={`checkbox-category-${item.toLowerCase().replace(/\s+/g, "-")}`}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-sm w-full">{item}</FormLabel>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="productDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Please describe the artwork or products you plan to sell <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Textarea placeholder="Detailed description of your products..." className="min-h-[120px] resize-y bg-background" {...field} data-testid="textarea-product-description" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="artistBio" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Artist / Exhibitor Bio <span className="text-destructive">*</span></FormLabel>
                  <FormDescription>(Tell us about yourself, your process, and your work)</FormDescription>
                  <FormControl><Textarea placeholder="Your artist story..." className="min-h-[120px] resize-y bg-background" {...field} data-testid="textarea-artist-bio" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isArtisanFoodVendor" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">Are you applying as an artisan food vendor? <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1" data-testid="radiogroup-food-vendor">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="yes" data-testid="radio-food-vendor-yes" /></FormControl>
                        <FormLabel className="font-normal cursor-pointer">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="no" data-testid="radio-food-vendor-no" /></FormControl>
                        <FormLabel className="font-normal cursor-pointer">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </section>

            {/* Marketing Materials */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Marketing Materials Submission</h3>
              <FormField control={form.control} name="logo" render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Upload your business logo (optional but recommended)</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" className="bg-background file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-semibold hover:file:bg-primary/20 cursor-pointer"
                      onChange={(e) => onChange(e.target.files)} {...fieldProps} data-testid="input-file-logo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <PhotoUploadField form={form} selectedPhotos={selectedPhotos} photoInputRef={photoInputRef} onAdd={handlePhotoAdd} onRemove={handlePhotoRemove} />
            </section>

            {/* Agreements */}
            <section className="space-y-4 pt-6 border-t border-border/50">
              <FormField control={form.control} name="grantPromoPermission" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-muted/30">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-promo-permission" /></FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-normal cursor-pointer leading-snug">
                      By submitting an application, vendors grant permission for the Sauga Artisan Festival to use submitted images and videos of their products for promotional purposes <span className="text-destructive">*</span>
                    </FormLabel>
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-muted/30">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-agree-terms" /></FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-normal cursor-pointer leading-snug">
                      I confirm that I have read and agree to the Vendor Terms & Conditions of the Sauga Artisan Festival. <span className="text-destructive">*</span>
                    </FormLabel>
                  </div>
                </FormItem>
              )} />
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-start gap-2 mt-4">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">Please fix the errors above before submitting the application.</p>
                </div>
              )}
            </section>

            <div className="pt-8 flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-6 text-lg font-semibold bg-primary hover:bg-secondary hover:text-secondary-foreground text-primary-foreground shadow-md transition-all active:scale-[0.98]"
                data-testid="button-submit-application">
                {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting Application...</>) : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ── Food Vendor Form ──────────────────────────────────────────────────────────

function FoodForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      firstName: "", lastName: "", businessName: "", phoneNumber: "", emailAddress: "",
      website: "", instagram: "", facebook: "", foodDescription: "",
      setupType: undefined, grantPromoPermission: false, agreeToTerms: false,
    },
  });

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;
    const updated = [...selectedPhotos, ...newFiles];
    setSelectedPhotos(updated);
    form.setValue("photos", updated, { shouldValidate: true });
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handlePhotoRemove = (index: number) => {
    const updated = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(updated);
    form.setValue("photos", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: FoodFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("applicantType", "food");
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      if (data.businessName) formData.append("businessName", data.businessName);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("emailAddress", data.emailAddress);
      if (data.website) formData.append("website", data.website);
      if (data.instagram) formData.append("instagram", data.instagram);
      if (data.facebook) formData.append("facebook", data.facebook);
      formData.append("productDescription", data.foodDescription);
      formData.append("setupType", data.setupType);
      formData.append("grantPromoPermission", data.grantPromoPermission ? "true" : "false");
      formData.append("agreeToTerms", data.agreeToTerms ? "true" : "false");
      if (data.logo && data.logo.length > 0) formData.append("logo", data.logo[0]);
      if (data.photos && data.photos.length > 0) {
        for (let i = 0; i < data.photos.length; i++) formData.append("photos", data.photos[i]);
      }

      const response = await fetch("/api/applications", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to submit application");
      onSuccess();
      toast({ title: "Application Submitted Successfully", description: "We have received your application." });
    } catch {
      toast({ variant: "destructive", title: "Submission Error", description: "There was an error submitting your application. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-xl bg-card">
      <CardContent className="p-6 md:p-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

            {/* Business Information */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">First Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Jane" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Last Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Smith" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="businessName" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel className="text-base">Business Name (if applicable)</FormLabel>
                    <FormControl><Input placeholder="e.g. Jane's Kitchen" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Phone Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="tel" placeholder="(905) 555-0100" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="emailAddress" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Email Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="email" placeholder="jane@example.com" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Website (if available)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="instagram" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Instagram</FormLabel>
                    <FormControl><Input placeholder="@handle" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="facebook" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel className="text-base">Facebook</FormLabel>
                    <FormControl><Input placeholder="Page Name or URL" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
              </div>
            </section>

            {/* Food Vendor Details */}
            <section className="space-y-8">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Food Vendor Details</h3>

              <FormField control={form.control} name="foodDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Please describe the food or products you plan to sell <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormDescription>e.g. Homemade jerk chicken, rice and peas, plantain, and fresh lemonade</FormDescription>
                  <FormControl>
                    <Textarea placeholder="Describe your food products in detail..." className="min-h-[120px] resize-y bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="setupType" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">
                    Food Truck or Tent Setup? <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                      {([
                        {
                          value: "truck", label: "Food Truck",
                          svg: (
                            <svg viewBox="0 0 120 85" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-16">
                              <rect x="5" y="22" width="88" height="42" rx="5" fill="#e7572f"/>
                              <rect x="80" y="30" width="30" height="34" rx="4" fill="#c94a25"/>
                              <rect x="84" y="34" width="22" height="16" rx="3" fill="#bde0f5" opacity="0.85"/>
                              <line x1="95" y1="38" x2="95" y2="50" stroke="#a83a1a" strokeWidth="1.5"/>
                              <rect x="8" y="17" width="66" height="9" rx="3" fill="#3d0082"/>
                              <rect x="19" y="17" width="4" height="9" fill="#fdb92e" opacity="0.75"/>
                              <rect x="35" y="17" width="4" height="9" fill="#fdb92e" opacity="0.75"/>
                              <rect x="51" y="17" width="4" height="9" fill="#fdb92e" opacity="0.75"/>
                              <rect x="12" y="29" width="58" height="23" rx="2" fill="#fff8e6"/>
                              <rect x="12" y="29" width="58" height="4" fill="#fdb92e"/>
                              <circle cx="30" cy="44" r="6" fill="#e7572f"/>
                              <circle cx="30" cy="44" r="3.5" fill="#fdb92e"/>
                              <rect x="43" y="36" width="8" height="13" rx="2" fill="#3d0082"/>
                              <rect x="55" y="37" width="9" height="11" rx="2" fill="#e7572f" opacity="0.6"/>
                              <rect x="10" y="50" width="62" height="5" rx="1" fill="#fdb92e"/>
                              <rect x="5" y="60" width="107" height="5" rx="2" fill="#a83a1a"/>
                              <circle cx="27" cy="70" r="12" fill="#1a0040"/>
                              <circle cx="27" cy="70" r="7.5" fill="#3d0082"/>
                              <circle cx="27" cy="70" r="3" fill="#fdb92e"/>
                              <line x1="27" y1="62.5" x2="27" y2="77.5" stroke="#5b21b6" strokeWidth="1.5"/>
                              <line x1="19.5" y1="70" x2="34.5" y2="70" stroke="#5b21b6" strokeWidth="1.5"/>
                              <circle cx="88" cy="70" r="12" fill="#1a0040"/>
                              <circle cx="88" cy="70" r="7.5" fill="#3d0082"/>
                              <circle cx="88" cy="70" r="3" fill="#fdb92e"/>
                              <line x1="88" y1="62.5" x2="88" y2="77.5" stroke="#5b21b6" strokeWidth="1.5"/>
                              <line x1="80.5" y1="70" x2="95.5" y2="70" stroke="#5b21b6" strokeWidth="1.5"/>
                              <rect x="99" y="10" width="5" height="13" rx="2.5" fill="#555"/>
                              <ellipse cx="101.5" cy="10" rx="4" ry="3" fill="#888" opacity="0.5"/>
                              <ellipse cx="104" cy="7" rx="3" ry="2" fill="#aaa" opacity="0.3"/>
                            </svg>
                          ),
                        },
                        {
                          value: "tent", label: "Tent Setup",
                          svg: (
                            <svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16">
                              <polygon points="50,6 3,47 97,47" fill="#3d0082"/>
                              <polygon points="50,6 3,47 24,47" fill="#2d0060" opacity="0.25"/>
                              <rect x="3" y="44" width="94" height="7" rx="2" fill="#fdb92e"/>
                              <rect x="3" y="51" width="24" height="31" fill="#4a009a"/>
                              <rect x="73" y="51" width="24" height="31" fill="#4a009a"/>
                              <path d="M27 51 Q37 70 27 82" fill="#3d0082" opacity="0.45"/>
                              <path d="M73 51 Q63 70 73 82" fill="#3d0082" opacity="0.45"/>
                              <rect x="33" y="67" width="34" height="5" rx="1" fill="#fdb92e"/>
                              <rect x="36" y="72" width="3" height="10" fill="#c9901a"/>
                              <rect x="61" y="72" width="3" height="10" fill="#c9901a"/>
                              <rect x="37" y="61" width="8" height="6" rx="1" fill="#e7572f"/>
                              <rect x="47" y="62" width="7" height="5" rx="1" fill="#fdb92e"/>
                              <rect x="56" y="61" width="8" height="6" rx="1" fill="#da0b85"/>
                              <path d="M10 32 Q50 22 90 32" stroke="#fdb92e" strokeWidth="1" fill="none" opacity="0.7"/>
                              <polygon points="17,22 23,34 11,34" fill="#e7572f"/>
                              <polygon points="32,14 38,26 26,26" fill="#fdb92e"/>
                              <polygon points="50,8 56,20 44,20" fill="#22c55e" opacity="0.9"/>
                              <polygon points="68,14 74,26 62,26" fill="#e7572f"/>
                              <polygon points="83,22 89,34 77,34" fill="#fdb92e"/>
                            </svg>
                          ),
                        },
                      ] as const).map((opt) => (
                        <label key={opt.value}
                          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${field.value === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}>
                          <RadioGroupItem value={opt.value} className="sr-only" />
                          {opt.svg}
                          <span className="font-semibold text-sm text-foreground">{opt.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </section>

            {/* Marketing Materials */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Marketing Materials Submission</h3>
              <FormField control={form.control} name="logo" render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Upload your business logo (optional but recommended)</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" className="bg-background file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-semibold hover:file:bg-primary/20 cursor-pointer"
                      onChange={(e) => onChange(e.target.files)} {...fieldProps} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <PhotoUploadField form={form} selectedPhotos={selectedPhotos} photoInputRef={photoInputRef} onAdd={handlePhotoAdd} onRemove={handlePhotoRemove} />
            </section>

            {/* Agreements */}
            <section className="space-y-4 pt-6 border-t border-border/50">
              <FormField control={form.control} name="grantPromoPermission" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-muted/30">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-normal cursor-pointer leading-snug">
                      By submitting an application, I grant permission for the Sauga Artisan Festival to use submitted images and videos for promotional purposes <span className="text-destructive">*</span>
                    </FormLabel>
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-muted/30">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-normal cursor-pointer leading-snug">
                      I confirm that I have read and agree to the Food Vendor Terms & Conditions of the Sauga Artisan Festival. <span className="text-destructive">*</span>
                    </FormLabel>
                  </div>
                </FormItem>
              )} />
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-start gap-2 mt-4">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">Please fix the errors above before submitting the application.</p>
                </div>
              )}
            </section>

            <div className="pt-8 flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-6 text-lg font-semibold bg-primary hover:bg-secondary hover:text-secondary-foreground text-primary-foreground shadow-md transition-all active:scale-[0.98]">
                {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting Application...</>) : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ── Main Apply Page ───────────────────────────────────────────────────────────

export default function Apply() {
  const [vendorType, setVendorType] = useState<"artisan" | "food">("artisan");
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return <SuccessScreen onReset={() => setIsSuccess(false)} />;
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Back Button */}
        <div>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-[#e7572f] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>

        {/* Header */}
        <div className="text-center space-y-3 mb-2">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight uppercase">
            Sauga Artisan Festival
          </h1>
          <p className="text-2xl md:text-3xl font-caveat text-primary font-semibold">
            Vendor Application
          </p>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full mt-4"></div>
          <p className="mt-4 text-base max-w-2xl mx-auto text-foreground/80 leading-relaxed">
            Apply to join a curated group of local artists, makers, and food vendors at the inaugural Sauga Artisan Festival — celebrating creativity, craftsmanship, and community.
          </p>
        </div>

        {/* Vendor Type Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border-2 border-primary p-1 gap-1 bg-background shadow-sm">
            <button
              onClick={() => setVendorType("artisan")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${vendorType === "artisan" ? "bg-primary text-primary-foreground shadow" : "text-primary hover:bg-primary/5"}`}
            >
              <Palette className="w-4 h-4" /> Artisan Vendor
            </button>
            <button
              onClick={() => setVendorType("food")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${vendorType === "food" ? "bg-primary text-primary-foreground shadow" : "text-primary hover:bg-primary/5"}`}
            >
              <UtensilsCrossed className="w-4 h-4" /> Food Vendor
            </button>
          </div>
        </div>

        {/* Fee banner */}
        <div className={`text-center text-sm font-semibold rounded-full py-2 px-6 mx-auto w-fit ${vendorType === "food" ? "bg-secondary/20 text-secondary-foreground" : "bg-primary/10 text-primary"}`}>
          {vendorType === "artisan" ? "Vendor Fee: $100 + HST" : "Vendor Fee: $175 + HST"}
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[380px] lg:shrink-0 lg:sticky lg:top-6">
            {vendorType === "artisan" ? <ArtisanTermsPanel /> : <FoodTermsPanel />}
          </div>
          <div className="flex-1 min-w-0">
            {vendorType === "artisan"
              ? <ArtisanForm onSuccess={() => setIsSuccess(true)} />
              : <FoodForm onSuccess={() => setIsSuccess(true)} />
            }
          </div>
        </div>

      </div>
    </div>
  );
}
