"use client"

import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, ExternalLink, Calendar, ArrowRight } from "lucide-react"
import { WebsiteConfiguration } from "@prisma/client"
import { motion } from "framer-motion"

interface ContactInfo {
  type: "PHONE" | "EMAIL" | "ADDRESS" | "SOCIAL"
  label: string
  value: string
  iconName: keyof typeof iconMap
}

const iconMap = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
}

interface ContactSectionProps {
    websiteConfig: WebsiteConfiguration | null;
}

export function ContactSection({ websiteConfig }: ContactSectionProps) {
  if (!websiteConfig) return null;

  const contacts: ContactInfo[] = [];
  if (websiteConfig.primaryPhone) {
    contacts.push({ type: 'PHONE', label: 'Main Hotline', value: websiteConfig.primaryPhone, iconName: 'phone' });
  }
  if (websiteConfig.primaryEmail) {
    contacts.push({ type: 'EMAIL', label: 'General Inquiries', value: websiteConfig.primaryEmail, iconName: 'mail' });
  }
  if (websiteConfig.headquarters) {
    contacts.push({ type: 'ADDRESS', label: 'Head Office', value: websiteConfig.headquarters, iconName: 'map-pin' });
  }

  const formatContactValue = (contact: ContactInfo) => {
    switch (contact.type) {
      case "PHONE": return `tel:${contact.value.replace(/\s/g, "")}`;
      case "EMAIL": return `mailto:${contact.value}`;
      case "ADDRESS": return `https://maps.google.com/?q=${encodeURIComponent(contact.value)}`;
      case "SOCIAL": return contact.value.startsWith("http") ? contact.value : `https://${contact.value}`;
      default: return contact.value;
    }
  };

  const isClickable = (type: string) => ["PHONE", "EMAIL", "ADDRESS", "SOCIAL"].includes(type);

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-100/30 to-orange-100/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-100/20 to-amber-100/30 rounded-full blur-3xl" />
        
        {/* Floating geometric shapes */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 right-1/4 w-4 h-4 bg-amber-400/20 rounded-sm"
        />
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 right-1/3 w-3 h-3 bg-orange-400/30 rounded-full"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-serif text-slate-800 mb-3 tracking-tight">
            Connect With{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              Excellence
            </span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto leading-relaxed">
            Our dedicated concierge team is available around the clock to ensure your experience exceeds expectations.
          </p>
        </motion.div>

        {/* Contact Info - Horizontal Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contacts.map((contact, index) => {
              const IconComponent = iconMap[contact.iconName] || Phone;
              const href = formatContactValue(contact);
              const isLink = isClickable(contact.type);

              return (
                <motion.div
                  key={contact.value}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="group text-center"
                >
                  {/* Icon */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg border border-amber-200/30">
                      <IconComponent className="w-7 h-7 text-amber-600" />
                    </div>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 w-16 h-16 bg-amber-400/20 rounded-2xl mx-auto blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-amber-600 transition-colors capitalize">
                      {contact.type.toLowerCase()}
                    </h3>
                    <div className="text-sm font-medium text-slate-500 mb-2">{contact.label}</div>
                    {isLink ? (
                      <a
                        href={href}
                        target={contact.type === "ADDRESS" ? "_blank" : undefined}
                        rel={contact.type === "ADDRESS" ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 font-medium text-sm transition-colors group/link"
                      >
                        <span className="break-all">{contact.value}</span>
                        {contact.type === "ADDRESS" && (
                          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        )}
                      </a>
                    ) : (
                      <div className="text-sm text-slate-600 font-medium break-all">{contact.value}</div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA Section - Enhanced */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="relative inline-block">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base font-semibold group"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book Your Stay
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10" />
          </div>
          
          <p className="text-slate-500 text-sm mt-4 max-w-md mx-auto">
            Ready to experience luxury? Book your stay now and let us create unforgettable memories for you.
          </p>
        </motion.div>
      </div>
    </section>
  )
}