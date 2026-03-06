import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangleIcon,
  ClockIcon,
  ChevronDownIcon,
  XIcon } from
'lucide-react';
export function AlertBanners() {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const alertCount = 2;
  return (
    <>
      {/* Mobile: Compact collapsible alert bar */}
      <div className="sm:hidden">
        <motion.div
          initial={{
            opacity: 0,
            y: -10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-3 min-h-[48px] text-left active:bg-amber-100/50 transition-colors">

            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 p-1 bg-amber-100 rounded-md">
                <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-amber-800">
                {alertCount} alerts need attention
              </span>
            </div>
            <div className="flex items-center gap-1">
              <motion.div
                animate={{
                  rotate: expanded ? 180 : 0
                }}
                transition={{
                  duration: 0.2
                }}>

                <ChevronDownIcon className="w-4 h-4 text-amber-600" />
              </motion.div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDismissed(true);
                }}
                className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-amber-100 active:bg-amber-200 rounded-lg transition-colors"
                aria-label="Dismiss alerts"
              >
                <XIcon className="w-4 h-4 text-amber-500" />
              </button>
            </div>
          </button>

          <AnimatePresence>
            {expanded &&
            <motion.div
              initial={{
                height: 0,
                opacity: 0
              }}
              animate={{
                height: 'auto',
                opacity: 1
              }}
              exit={{
                height: 0,
                opacity: 0
              }}
              transition={{
                duration: 0.2
              }}
              className="overflow-hidden">

                <div className="px-3 pb-3 space-y-2">
                  <div className="bg-white/60 rounded-lg p-2.5 flex items-start gap-2.5">
                    <AlertTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        1 product needs restocking
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Aveeno Baby Lotion is below your reorder point.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2.5 flex items-start gap-2.5">
                    <ClockIcon className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        1 expiring soon
                      </p>
                      <p className="text-xs text-orange-700 mt-0.5">
                        Aveeno Baby Lotion (Expires in 15 days)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop: Full alert banners (unchanged) */}
      <div className="hidden sm:block space-y-3">
        <motion.div
          initial={{
            opacity: 0,
            x: -20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          transition={{
            duration: 0.3,
            delay: 0.4
          }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">

          <div className="flex-shrink-0 p-1.5 bg-amber-100 rounded-lg">
            <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">
              1 product needs restocking
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              Aveeno Baby Lotion is below your reorder point.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            x: -20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          transition={{
            duration: 0.3,
            delay: 0.5
          }}
          className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">

          <div className="flex-shrink-0 p-1.5 bg-orange-100 rounded-lg">
            <ClockIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-orange-800">1 expiring soon</p>
            <p className="text-sm text-orange-700 mt-0.5">
              Aveeno Baby Lotion (Expires in 15 days)
            </p>
          </div>
        </motion.div>
      </div>
    </>);

}