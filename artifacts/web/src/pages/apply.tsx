import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, UploadCloud, Info, AlertCircle, Loader2, X, ImageIcon } from "lucide-react";
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

const formSchema = z.object({
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
  isArtisanFoodVendor: z.enum(["yes", "no"], {
    required_error: "Please specify if you are an artisan food vendor",
  }),
  logo: z
    .any()
    .optional()
    .refine((files) => {
      if (!files || files.length === 0) return true;
      return files[0]?.size <= MAX_FILE_SIZE;
    }, "Max file size is 10MB.")
    .refine((files) => {
      if (!files || files.length === 0) return true;
      return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
    }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
  photos: z
    .any()
    .refine((files) => files?.length >= 3, "Please upload at least 3 photos")
    .refine((files) => {
      if (!files) return false;
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_FILE_SIZE) return false;
      }
      return true;
    }, "Max file size per photo is 10MB.")
    .refine((files) => {
      if (!files) return false;
      for (let i = 0; i < files.length; i++) {
        if (!ACCEPTED_IMAGE_TYPES.includes(files[i].type)) return false;
      }
      return true;
    }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
  grantPromoPermission: z.boolean().refine((val) => val === true, {
    message: "You must grant permission to proceed",
  }),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms to proceed",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const PRODUCT_CATEGORIES = [
  "Original Art",
  "Handmade Jewelry",
  "Ceramics",
  "Textiles",
  "Woodwork",
  "Artisan Food",
  "Candles",
  "Other",
];

function TermsPanel() {
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
            <h3 className="text-lg font-sans font-bold text-primary mb-3">
              Booth Space & Vendor Setup
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Each vendor will be provided with a 12' × 12' outdoor space to set up their booth.</li>
              <li>Vendors are responsible for bringing all equipment required for their booth setup that fits within their assigned space.</li>
            </ul>
          </section>

          <Separator className="bg-border/50" />

          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">
              Application & Selection Process
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>The deadline for application is Sunday, May 31, 2026.</li>
              <li>Accepted vendors will receive a confirmation email with payment instructions and next steps.</li>
              <li>Submission of an application does not guarantee acceptance.</li>
            </ul>
          </section>

          <Separator className="bg-border/50" />

          <section>
            <h3 className="text-lg font-sans font-bold text-primary mb-3">
              Booth Fees & Payment Policy
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Vendor Fee: $100 + HST</li>
              <li>Booth space is not confirmed until payment is received in full</li>
              <li>Booth fees are non-refundable</li>
              <li>The event will proceed rain or shine</li>
              <li>
                For questions or assistance with the application, please contact:{" "}
                <a
                  href="mailto:art@saugaartisanfest.ca"
                  className="text-accent hover:text-primary transition-colors font-semibold underline underline-offset-2"
                >
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

export default function Home() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      streetAddress: "",
      city: "",
      province: "",
      postalCode: "",
      phoneNumber: "",
      emailAddress: "",
      website: "",
      instagram: "",
      facebook: "",
      onlineStore: "",
      otherSocialMedia: "",
      productCategories: [],
      productDescription: "",
      artistBio: "",
      isArtisanFoodVendor: undefined,
      grantPromoPermission: false,
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

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

      if (data.logo && data.logo.length > 0) {
        formData.append("logo", data.logo[0]);
      }

      if (data.photos && data.photos.length > 0) {
        for (let i = 0; i < data.photos.length; i++) {
          formData.append("photos", data.photos[i]);
        }
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setIsSuccess(true);
      toast({
        title: "Application Submitted Successfully",
        description: "We have received your application.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "There was an error submitting your application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
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
            onClick={() => {
              form.reset();
              setSelectedPhotos([]);
              setIsSuccess(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-semibold bg-primary hover:bg-secondary hover:text-secondary-foreground text-primary-foreground transition-colors"
            data-testid="button-submit-another"
          >
            Submit Another Application
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight uppercase">
            Sauga Artisan Festival
          </h1>
          <p className="text-2xl md:text-3xl font-caveat text-primary font-semibold">
            Artisan Vendor Application
          </p>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full mt-4"></div>
          <p className="mt-4 text-base max-w-2xl mx-auto text-foreground/80 leading-relaxed">
            Apply to join a curated group of local artists, makers, and artisan vendors at the inaugural Sauga Artisan Festival — celebrating creativity, craftsmanship, and community.
          </p>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT COLUMN — Terms & Conditions (sticky on desktop) */}
          <div className="w-full lg:w-[380px] lg:shrink-0 lg:sticky lg:top-6">
            <TermsPanel />
          </div>

          {/* RIGHT COLUMN — Vendor Application Form */}
          <div className="flex-1 min-w-0">
            <Card className="border-primary/10 shadow-xl bg-card">
              <CardContent className="p-6 md:p-10">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                    {/* Applicant Information */}
                    <section className="space-y-6">
                      <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">
                        Applicant Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">First Name <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Jane" {...field} className="bg-background" data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Last Name <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} className="bg-background" data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-base">Business Name (if applicable)</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane's Art Studio" {...field} className="bg-background" data-testid="input-business-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </section>

                    {/* Contact Information */}
                    <section className="space-y-6">
                      <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="streetAddress"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-base">Street Address <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="123 Artisan Way" {...field} className="bg-background" data-testid="input-street-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">City <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Mississauga" {...field} className="bg-background" data-testid="input-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Province <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="ON" {...field} className="bg-background" data-testid="input-province" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Postal Code <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="L5B 2C9" {...field} className="bg-background" data-testid="input-postal-code" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Phone Number <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="(555) 123-4567" {...field} className="bg-background" data-testid="input-phone-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emailAddress"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-base">Email Address <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="jane@example.com" {...field} className="bg-background" data-testid="input-email-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </section>

                    {/* Online Presence */}
                    <section className="space-y-6">
                      <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">
                        Online Presence
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Website (if available)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} className="bg-background" data-testid="input-website" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Instagram</FormLabel>
                              <FormControl>
                                <Input placeholder="@handle" {...field} className="bg-background" data-testid="input-instagram" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="facebook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Facebook</FormLabel>
                              <FormControl>
                                <Input placeholder="Page Name or URL" {...field} className="bg-background" data-testid="input-facebook" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="onlineStore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Online Store / E-commerce Link</FormLabel>
                              <FormDescription>If different from website</FormDescription>
                              <FormControl>
                                <Input placeholder="Etsy, Shopify, etc." {...field} className="bg-background" data-testid="input-online-store" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="otherSocialMedia"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-base">Other Social Media Links</FormLabel>
                              <FormControl>
                                <Input placeholder="TikTok, Pinterest, etc." {...field} className="bg-background" data-testid="input-other-social" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </section>

                    {/* Vendor Details */}
                    <section className="space-y-8">
                      <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">
                        Vendor Details
                      </h3>

                      <FormField
                        control={form.control}
                        name="productCategories"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base font-semibold">Product Category (select all that apply) <span className="text-destructive">*</span></FormLabel>
                              <FormDescription>
                                (Examples: Original Art, Handmade Jewelry, Ceramics, Textiles, Woodwork, Artisan Food, Candles, etc.)
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {PRODUCT_CATEGORIES.map((item) => (
                                <FormField
                                  key={item}
                                  control={form.control}
                                  name="productCategories"
                                  render={({ field }) => (
                                    <FormItem
                                      key={item}
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/5 transition-colors cursor-pointer"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item])
                                              : field.onChange(
                                                  field.value?.filter((v) => v !== item)
                                                );
                                          }}
                                          data-testid={`checkbox-category-${item.toLowerCase().replace(/\s+/g, "-")}`}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer text-sm w-full">
                                        {item}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="productDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">
                              Please describe the artwork or products you plan to sell at the Sauga Artisan Festival <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed description of your products..."
                                className="min-h-[120px] resize-y bg-background"
                                {...field}
                                data-testid="textarea-product-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="artistBio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Artist / Exhibitor Bio <span className="text-destructive">*</span></FormLabel>
                            <FormDescription>
                              (Tell us about yourself, your process, and your work)
                            </FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="Your artist story..."
                                className="min-h-[120px] resize-y bg-background"
                                {...field}
                                data-testid="textarea-artist-bio"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isArtisanFoodVendor"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold">
                              Are you applying as an artisan food vendor? <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                                data-testid="radiogroup-food-vendor"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="yes" data-testid="radio-food-vendor-yes" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">Yes</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="no" data-testid="radio-food-vendor-no" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">No</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </section>

                    {/* Marketing Materials Submission */}
                    <section className="space-y-6">
                      <h3 className="text-2xl font-sans font-bold text-primary border-b border-border/50 pb-2">
                        Marketing Materials Submission
                      </h3>

                      <FormField
                        control={form.control}
                        name="logo"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Upload your business logo (optional but recommended)</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                className="bg-background file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-semibold hover:file:bg-primary/20 cursor-pointer"
                                onChange={(e) => onChange(e.target.files)}
                                {...fieldProps}
                                data-testid="input-file-logo"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="photos"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">
                              Upload at least 3 recent photos of the products you intend to sell at the festival <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormDescription>
                              (These images may be used for promotional purposes if your application is accepted)
                            </FormDescription>
                            <FormControl>
                              <div className="space-y-3">
                                <input
                                  ref={photoInputRef}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={handlePhotoAdd}
                                  data-testid="input-file-photos"
                                />
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
                                        <button
                                          type="button"
                                          onClick={() => handlePhotoRemove(i)}
                                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                                          aria-label="Remove photo"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {selectedPhotos.length} / 3 minimum selected · JPG, PNG, WebP · Max 10MB each
                                </p>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </section>

                    {/* Agreements */}
                    <section className="space-y-4 pt-6 border-t border-border/50">
                      <FormField
                        control={form.control}
                        name="grantPromoPermission"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-muted/30">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-promo-permission"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base font-normal cursor-pointer leading-snug">
                                By submitting an application, vendors grant permission for the Sauga Artisan Festival to use submitted images and videos of their products for promotional purposes <span className="text-destructive">*</span>
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-muted/30">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-agree-terms"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-base font-normal cursor-pointer leading-snug">
                                I confirm that I have read and agree to the Vendor Terms & Conditions of the Sauga Artisan Festival. <span className="text-destructive">*</span>
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {Object.keys(form.formState.errors).length > 0 && (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-start gap-2 mt-4">
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <p className="text-sm font-medium">Please fix the errors above before submitting the application.</p>
                        </div>
                      )}
                    </section>

                    <div className="pt-8 flex justify-end">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-8 py-6 text-lg font-semibold bg-primary hover:bg-secondary hover:text-secondary-foreground text-primary-foreground shadow-md transition-all active:scale-[0.98]"
                        data-testid="button-submit-application"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting Application...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
