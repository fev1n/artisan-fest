import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, UploadCloud, AlertCircle, Loader2, X, ImageIcon, ArrowLeft, Info } from "lucide-react";
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

const singleFileRules = z
  .any()
  .optional()
  .refine((files) => { if (!files || files.length === 0) return true; return files[0]?.size <= MAX_FILE_SIZE; }, "Max file size is 10MB.")
  .refine((files) => { if (!files || files.length === 0) return true; return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type); }, "Only .jpg, .jpeg, .png and .webp formats are supported.");

const photoRules = z
  .any()
  .optional()
  .refine((files) => {
    if (!files || files.length === 0) return true;
    for (let i = 0; i < files.length; i++) if (files[i].size > MAX_FILE_SIZE) return false;
    return true;
  }, "Max file size per photo is 10MB.")
  .refine((files) => {
    if (!files || files.length === 0) return true;
    for (let i = 0; i < files.length; i++) if (!ACCEPTED_IMAGE_TYPES.includes(files[i].type)) return false;
    return true;
  }, "Only .jpg, .jpeg, .png and .webp formats are supported.");

const schema = z.object({
  performerName: z.string().min(1, "Artist / Band / Performance Name is required"),
  performanceType: z.enum(["solo", "duo", "band", "dj", "dance", "cultural", "other"], { required_error: "Please select a performance type" }),
  performanceTypeOther: z.string().optional(),
  genre: z.string().min(1, "Genre is required"),
  contactPersonName: z.string().min(1, "Contact Person Name is required"),
  emailAddress: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone Number is required"),
  performanceDescription: z.string().min(1, "Please describe your performance"),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  otherMediaLink: z.string().optional(),
  requiresCompensation: z.enum(["yes", "no"], { required_error: "Please specify if you require compensation" }),
  performanceFee: z.string().optional(),
  logo: singleFileRules,
  photos: photoRules,
  videoLink: z.string().min(1, "Please provide a link to a recent live performance video"),
  agreeToTerms: z.boolean().refine((val) => val === true, { message: "You must agree to the terms to proceed" }),
  agreeToPaSystem: z.boolean().refine((val) => val === true, { message: "You must confirm the PA system acknowledgement to proceed" }),
});

type FormValues = z.infer<typeof schema>;

const PERFORMANCE_TYPES = [
  { value: "solo", label: "Solo Artist" },
  { value: "duo", label: "Duo" },
  { value: "band", label: "Band" },
  { value: "dj", label: "DJ" },
  { value: "dance", label: "Dance Performance" },
  { value: "cultural", label: "Cultural Performance" },
  { value: "other", label: "Other" },
];

function PerformerTermsPanel() {
  return (
    <div className="space-y-6 text-foreground/90">
      <Card className="border-none shadow-sm bg-card/60">
        <CardContent className="p-6 space-y-7">
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" /> Performer Terms & Conditions
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Performance times, duration, and stage assignments are determined by the Organizer.</li>
              <li>Submission of an application does not guarantee selection.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Equipment</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>The Organizer will provide a basic PA sound system only. Performers are responsible for bringing all other equipment required for their performance.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Setup & Teardown</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Performers must arrive during the designated load-in period and complete setup and teardown promptly.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Performance Content & Promotion</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Performances must be appropriate for a family-friendly audience.</li>
              <li>The Organizer may use submitted photos, logos, and event photographs for promotional purposes.</li>
            </ul>
          </section>
          <Separator className="bg-border/50" />
          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">Conduct & Force Majeure</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Performers must follow directions from event staff and treat everyone respectfully.</li>
              <li>The Organizer may modify or cancel performances due to weather, safety concerns, municipal requirements, or circumstances beyond its reasonable control.</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl text-center p-8 sm:p-12 border-primary/20 shadow-lg bg-card text-card-foreground">
        <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-sans font-bold mb-4 text-foreground">Thank You!</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Your performer application for the Sauga Artisan Festival has been successfully submitted.
          You will receive a confirmation email shortly with further details and next steps.
        </p>
        <Button
          size="lg"
          onClick={onReset}
          className="font-semibold bg-primary hover:bg-secondary hover:text-secondary-foreground text-primary-foreground transition-colors"
        >
          Submit Another Application
        </Button>
      </Card>
    </div>
  );
}

function PerformerForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      performerName: "", performanceType: undefined, performanceTypeOther: "",
      genre: "", contactPersonName: "", emailAddress: "", phoneNumber: "",
      performanceDescription: "", website: "", instagram: "", facebook: "",
      otherMediaLink: "", requiresCompensation: undefined, performanceFee: "",
      logo: undefined, photos: [], videoLink: "",
      agreeToTerms: false, agreeToPaSystem: false,
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

  const requiresCompensation = form.watch("requiresCompensation");

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("performerName", data.performerName);
      formData.append("performanceType", data.performanceType === "other" && data.performanceTypeOther ? data.performanceTypeOther : data.performanceType);
      formData.append("genre", data.genre);
      formData.append("contactPersonName", data.contactPersonName);
      formData.append("emailAddress", data.emailAddress);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("performanceDescription", data.performanceDescription);
      if (data.website) formData.append("website", data.website);
      if (data.instagram) formData.append("instagram", data.instagram);
      if (data.facebook) formData.append("facebook", data.facebook);
      if (data.otherMediaLink) formData.append("otherMediaLink", data.otherMediaLink);
      formData.append("requiresCompensation", data.requiresCompensation);
      if (data.requiresCompensation === "yes" && data.performanceFee) formData.append("performanceFee", data.performanceFee);
      formData.append("videoLink", data.videoLink);
      formData.append("agreeToTerms", data.agreeToTerms ? "true" : "false");
      formData.append("agreeToPaSystem", data.agreeToPaSystem ? "true" : "false");
      if (data.logo && data.logo.length > 0) formData.append("logo", data.logo[0]);
      if (data.photos && data.photos.length > 0) {
        for (let i = 0; i < data.photos.length; i++) formData.append("photos", data.photos[i]);
      }

      const response = await fetch("/api/performers", { method: "POST", body: formData });
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

            {/* Performer Information */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Performer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="performerName" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-base">Artist / Band / Performance Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. The Rhythm Collective" {...field} className="bg-background" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="performanceType" render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base font-semibold">Performance Type <span className="text-destructive">*</span> (Select one)</FormLabel>
                  </div>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PERFORMANCE_TYPES.map((opt) => (
                      <label key={opt.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${field.value === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}>
                        <RadioGroupItem value={opt.value} className="sr-only" />
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${field.value === opt.value ? "border-primary" : "border-border"}`}>
                          {field.value === opt.value && <span className="w-2 h-2 rounded-full bg-primary" />}
                        </span>
                        <span className="font-semibold text-sm text-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )} />

              {form.watch("performanceType") === "other" && (
                <FormField control={form.control} name="performanceTypeOther" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Please specify performance type <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Comedian, Fire Performer, Poetry…" {...field} className="bg-background" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="genre" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Genre <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="e.g. Indie Rock, Acoustic, R&B, Folk…" {...field} className="bg-background" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="contactPersonName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Contact Person Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Jane Doe" {...field} className="bg-background" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="emailAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Email Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="email" placeholder="jane@example.com" {...field} className="bg-background" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Phone Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} className="bg-background" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="performanceDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Please briefly describe your performance <span className="text-destructive">*</span></FormLabel>
                  <FormDescription>Tell us about your act, performance style, audience experience, and whether you perform original material, cover songs, DJ sets, instrumental music, cultural performances, etc.</FormDescription>
                  <FormControl><Textarea placeholder="Describe your performance…" className="min-h-[120px] resize-y bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </section>

            {/* Social Media */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Social Media & Promotion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Website (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="instagram" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Instagram (Optional)</FormLabel>
                    <FormControl><Input placeholder="@handle" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="facebook" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">Facebook (Optional)</FormLabel>
                    <FormControl><Input placeholder="Page Name or URL" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="otherMediaLink" render={({ field }) => (
                  <FormItem><FormLabel className="text-base">YouTube / Spotify / SoundCloud / Others (Optional)</FormLabel>
                    <FormControl><Input placeholder="Link to your music/media" {...field} className="bg-background" /></FormControl>
                    <FormMessage /></FormItem>
                )} />
              </div>
            </section>

            {/* Compensation */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Compensation</h3>
              <FormField control={form.control} name="requiresCompensation" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">Do you require compensation for your performance? <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="yes" /></FormControl>
                        <FormLabel className="font-normal cursor-pointer">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="no" /></FormControl>
                        <FormLabel className="font-normal cursor-pointer">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {requiresCompensation === "yes" && (
                <FormField control={form.control} name="performanceFee" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Performance Fee <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="$" {...field} className="bg-background max-w-[200px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </section>

            {/* Uploads */}
            <section className="space-y-6">
              <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">Uploads</h3>

              <FormField control={form.control} name="logo" render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Artist / Band Logo (Optional)</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" className="bg-background file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-semibold hover:file:bg-primary/20 cursor-pointer"
                      onChange={(e) => onChange(e.target.files)} {...fieldProps} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField
                control={form.control}
                name="photos"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Recent Performance Photo(s)
                    </FormLabel>
                    <FormDescription>(These images may be used for promotional purposes)</FormDescription>
                    <FormControl>
                      <div className="space-y-3">
                        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
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
                                <button type="button" onClick={() => handlePhotoRemove(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove photo">
                                  <X className="w-4 h-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-xs text-muted-foreground">JPG, PNG, WebP · Max 10MB each</p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="videoLink" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Link to a Recent Live Performance Video <span className="text-destructive">*</span></FormLabel>
                  <FormDescription>Please provide a YouTube, Vimeo, or other link to a recent live performance video</FormDescription>
                  <FormControl><Input placeholder="https://youtube.com/..." {...field} className="bg-background" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </section>

            {/* Agreements */}
            <section className="space-y-4 pt-6 border-t border-border/50">
              <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-muted/30">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-normal cursor-pointer leading-snug">
                      I have read and agree to the Performer Terms & Conditions. I understand that submission of this application does not guarantee selection. <span className="text-destructive">*</span>
                    </FormLabel>
                  </div>
                </FormItem>
              )} />
              <FormField control={form.control} name="agreeToPaSystem" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-muted/30">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-normal cursor-pointer leading-snug">
                      I understand that the festival provides a basic PA sound system only and I am responsible for bringing any additional equipment required for my performance. <span className="text-destructive">*</span>
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

export default function Performer() {
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
            Performer / Entertainment Application
          </p>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full mt-4"></div>
          <p className="mt-4 text-base max-w-2xl mx-auto text-foreground/80 leading-relaxed">
            Apply to perform at the inaugural Sauga Artisan Festival — celebrating creativity, craftsmanship, and community through live music, dance, and cultural performances.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[380px] lg:shrink-0 lg:sticky lg:top-6">
            <PerformerTermsPanel />
          </div>
          <div className="flex-1 min-w-0">
            <PerformerForm onSuccess={() => setIsSuccess(true)} />
          </div>
        </div>

      </div>
    </div>
  );
}