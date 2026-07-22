import React from 'react';
import { PricingModel, RegistrationType } from '@/app/(authenticated)/studio/workshop/types';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

export const PricingForm: React.FC<Props> = ({ form }) => {
  const { pricing } = form.formData;
  
  if (!pricing) return null;

  const updatePricing = (field: string, value: any) => {
    form.handleChange('pricing', { ...pricing, [field]: value });
  };

  const isFree = pricing.pricingModel === PricingModel.FREE;
  const isUnlimited = !pricing.seatLimit || pricing.seatLimit <= 0;

  return (
    <div className="space-y-10">
      {/* Pricing Section */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Pricing</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pricing Model</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(PricingModel).map((model) => (
                <label
                  key={model}
                  className={`flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                    pricing.pricingModel === model 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name="pricingModel"
                    value={model}
                    checked={pricing.pricingModel === model}
                    onChange={(e) => updatePricing('pricingModel', e.target.value)}
                  />
                  <span className="text-sm font-medium">{model.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {!isFree && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.price || ''}
                    onChange={(e) => updatePricing('price', parseFloat(e.target.value))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-7 pr-12 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">{pricing.currency || 'USD'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Currency</label>
                <select
                  value={pricing.currency || 'USD'}
                  onChange={(e) => updatePricing('currency', e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Registration Section */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Registration</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registration Type</label>
            <select
              value={pricing.registrationType || RegistrationType.OPEN}
              onChange={(e) => updatePricing('registrationType', e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
            >
              {Object.keys(RegistrationType).map((type) => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registration Window (Starts)</label>
              <input
                type="datetime-local"
                value={pricing.registrationStartsAt ? new Date(pricing.registrationStartsAt).toISOString().slice(0,16) : ''}
                onChange={(e) => updatePricing('registrationStartsAt', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registration Window (Ends)</label>
              <input
                type="datetime-local"
                value={pricing.registrationEndsAt ? new Date(pricing.registrationEndsAt).toISOString().slice(0,16) : ''}
                onChange={(e) => updatePricing('registrationEndsAt', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seat Management Section */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Seat Management</h3>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={isUnlimited}
                onChange={() => updatePricing('seatLimit', undefined)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unlimited Seats</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!isUnlimited}
                onChange={() => updatePricing('seatLimit', 50)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Limited Seats</span>
            </label>
          </div>

          {!isUnlimited && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Seat Limit</label>
                <input
                  type="number"
                  min="1"
                  value={pricing.seatLimit || ''}
                  onChange={(e) => updatePricing('seatLimit', parseInt(e.target.value))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                />
              </div>

              <div className="flex items-center h-full pt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={pricing.waitlistEnabled || false}
                      onChange={(e) => updatePricing('waitlistEnabled', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${pricing.waitlistEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${pricing.waitlistEnabled ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Waitlist</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Early Bird Section (Hidden if Free) */}
      {!isFree && (
        <section>
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Early Bird</h3>
            <label className="flex items-center space-x-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={pricing.earlyBirdEnabled || false}
                  onChange={(e) => updatePricing('earlyBirdEnabled', e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${pricing.earlyBirdEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${pricing.earlyBirdEnabled ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>

          {pricing.earlyBirdEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <div>
                <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-1.5">Early Bird Price</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-indigo-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.earlyBirdPrice || ''}
                    onChange={(e) => updatePricing('earlyBirdPrice', parseFloat(e.target.value))}
                    className="w-full rounded-md border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900 pl-7 pr-12 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-indigo-500 sm:text-sm">{pricing.currency || 'USD'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-1.5">Ends On</label>
                <input
                  type="datetime-local"
                  value={pricing.earlyBirdEndsAt ? new Date(pricing.earlyBirdEndsAt).toISOString().slice(0,16) : ''}
                  onChange={(e) => updatePricing('earlyBirdEndsAt', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  className="w-full rounded-md border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* Policies Section */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Policies</h3>
        
        <div className="space-y-6">
          <div className="flex items-center">
            <label className="flex items-center space-x-3 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={pricing.allowCancellation || false}
                  onChange={(e) => updatePricing('allowCancellation', e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${pricing.allowCancellation ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${pricing.allowCancellation ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Cancellations</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Refund Policy</label>
            <textarea
              value={pricing.refundPolicy || ''}
              onChange={(e) => updatePricing('refundPolicy', e.target.value)}
              rows={4}
              placeholder="Explain your refund policy..."
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
