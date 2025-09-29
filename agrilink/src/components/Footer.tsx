
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import PWAInstallButton from "./PWAInstallButton";

// export default function Footer() {
//   const [email, setEmail] = useState("");
//   const [isSubscribing, setIsSubscribing] = useState(false);
//   const [subscriptionMessage, setSubscriptionMessage] = useState("");
//   const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "success" | "error">("idle");

//   const handleNewsletterSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email) return;

//     setIsSubscribing(true);
//     setSubscriptionMessage("");

//     try {
//       const response = await fetch("/api/newsletter", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email,
//           preferences: {
//             priceAlerts: true,
//             weeklyDigest: true,
//             marketNews: true,
//             forecastUpdates: true,
//           },
//         }),
//       });

//       if (response.ok) {
//         setSubscriptionStatus("success");
//         setSubscriptionMessage("🎉 Successfully subscribed! Check your email for confirmation.");
//         setEmail("");
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         setSubscriptionStatus("error");
//         setSubscriptionMessage(errorData.error || "Failed to subscribe. Please try again.");
//       }
//     } catch (err) {
//       setSubscriptionStatus("error");
//       setSubscriptionMessage("Network error. Please check your connection and try again.");
//     } finally {
//       setIsSubscribing(false);
//       setTimeout(() => {
//         setSubscriptionMessage("");
//         setSubscriptionStatus("idle");
//       }, 5000);
//     }
//   };

//   return (
//     <footer className="bg-gradient-to-r from-green-600 to-blue-600 text-white w-full">
//       {/* full-bleed background; inner container controls content width */}
//       <div className="w-full bg-transparent">
//         <div className="max-w-7xl mx-auto px-0 py-10">
//           {/* four columns in one line on md+ */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
//           {/* 1 - Brand */}
//           <div className="md:pl-1">
//             <h3 className="text-2xl font-bold text-green-100">AgriLink <span className="text-green-50 text-base font-normal">Sri Lanka</span></h3>
//             <p className="text-green-100/90 mt-4 max-w-sm">
//               Empowering Sri Lankan farmers with real-time market intelligence, price predictions, and agricultural insights.
//             </p>
//             <div className="flex items-center space-x-3 mt-6 text-green-100">
//               <a href="#" aria-label="twitter" className="hover:text-white"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
//               <a href="#" aria-label="x" className="hover:text-white"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg></a>
//               <a href="#" aria-label="linkedin" className="hover:text-white"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
//               <PWAInstallButton />
//             </div>
//           </div>

//           {/* 2 - Subscribe form (compact) */}
//           <div>
//             <h4 className="text-lg font-semibold mb-3">Subscribe</h4>
//             <p className="text-green-100/90 mb-4">Weekly market insights, price forecasts & tips.</p>
//             <form onSubmit={handleNewsletterSubmit} className="space-y-7">
//               <div className="flex">
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email address"
//                   className="flex-1 px-8 py-2 rounded-l-md text-gray-900 focus:outline-none border border-green-500"
//                   required
//                 />
//                 <button
//                   type="submit"
//                   disabled={isSubscribing}
//                   className="bg-white text-green-600 px-4 py-2 rounded-r-md font-semibold disabled:opacity-50 "
//                 >{isSubscribing ? '...' : 'Subscribe'}</button>
//               </div>
//               {subscriptionMessage && (
//                 <div className={`text-sm p-2 rounded ${subscriptionStatus === 'success' ? 'bg-white/20 text-white' : 'bg-white/10 text-white'}`}>
//                   {subscriptionMessage}
//                 </div>
//               )}
//           </form>
//           </div>

//           {/* 3 - Quick Links */}
//           <div>
//             <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
//             <ul className="space-y-1 text-green-100/90 md:pr-2">
//               <li><Link href="/">About Us</Link></li>
//               <li><a href="/products">Products</a></li>
//               <li><a href="/partners">Partners</a></li>
//               <li><a href="/contact">Contact</a></li>
//             </ul>
//           </div>

//           {/* 4 - Support */}
//           <div>
//             <h4 className="text-lg font-semibold mb-3">Support</h4>
//             <ul className="space-y-1 text-green-100/90">
//               <li><a href="#">Help Center</a></li>
//               <li><a href="#">Privacy Policy</a></li>
//               <li><a href="#">Terms of Service</a></li>
//               <li><a href="#">API Documentation</a></li>
//             </ul>
//           </div>
//         </div>

//         <div className="mt-8 border-t border-white/20 pt-6 text-center text-green-100/90 text-sm">
//           © 2025 AgriLink Sri Lanka. All rights reserved.
//         </div>
//         </div>
//       </div>
//     </footer>
//   );
// }


"use client";

import { useState } from "react";
import Link from "next/link";
import PWAInstallButton from "./PWAInstallButton";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "success" | "error">("idle");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    setSubscriptionMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          preferences: {
            priceAlerts: true,
            weeklyDigest: true,
            marketNews: true,
            forecastUpdates: true,
          },
        }),
      });

      if (response.ok) {
        setSubscriptionStatus("success");
        setSubscriptionMessage("🎉 Successfully subscribed! Check your email for confirmation.");
        setEmail("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubscriptionStatus("error");
        setSubscriptionMessage(errorData.error || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      setSubscriptionStatus("error");
      setSubscriptionMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubscribing(false);
      setTimeout(() => {
        setSubscriptionMessage("");
        setSubscriptionStatus("idle");
      }, 5000);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-green-600 to-blue-600 text-white w-full">
      {/* full-bleed background; inner container controls content width */}
      <div className="w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* four columns in one line on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* 1 - Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-1">AgriLink <span className="text-green-100 text-base font-normal">Sri Lanka</span></h3>
            <p className="text-green-100 mt-4 leading-relaxed">
              Empowering Sri Lankan farmers with real-time market intelligence, price predictions, and agricultural insights.
            </p>
            <div className="flex items-center space-x-3 mt-6 text-green-100">
              <a href="#" aria-label="twitter" className="hover:text-white"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
              <a href="#" aria-label="x" className="hover:text-white"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg></a>
              <a href="#" aria-label="linkedin" className="hover:text-white"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
              <PWAInstallButton />
            </div>
          </div>

          {/* 2 - Subscribe form (compact) */}
          <div className="md:col-span-1 w-full max-w-sm">
            <h4 className="text-lg font-semibold mb-4 text-white">Subscribe</h4>
            <p className="text-green-100 mb-4 leading-relaxed">Weekly market insights, price forecasts & tips.</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex flex-col space-y-2 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2.5 rounded-lg text-gray-900 text-sm bg-white border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600 focus:shadow-md placeholder-gray-500 transition-all duration-200"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="w-full bg-white text-green-600 px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
                >{isSubscribing ? 'Subscribing...' : 'Subscribe'}</button>
              </div>
              {subscriptionMessage && (
                <div className={`text-sm p-2 rounded ${subscriptionStatus === 'success' ? 'bg-white/20 text-white' : 'bg-white/10 text-white'}`}>
                  {subscriptionMessage}
                </div>
              )}
          </form>
          </div>

          {/* 3 - Quick Links */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-green-100 hover:text-white transition-colors duration-200 block">About Us</Link></li>
              <li><Link href="/products" className="text-green-100 hover:text-white transition-colors duration-200 block">Products</Link></li>
              <li><Link href="/partners" className="text-green-100 hover:text-white transition-colors duration-200 block">Partners</Link></li>
              <li><Link href="/contact" className="text-green-100 hover:text-white transition-colors duration-200 block">Contact</Link></li>
            </ul>
          </div>

          {/* 4 - Support */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-green-100 hover:text-white transition-colors duration-200 block">Help Center</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition-colors duration-200 block">Privacy Policy</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition-colors duration-200 block">Terms of Service</a></li>
              <li><a href="#" className="text-green-100 hover:text-white transition-colors duration-200 block">API Documentation</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-green-100 text-sm">
            © 2025 AgriLink Sri Lanka. All rights reserved.
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
}
