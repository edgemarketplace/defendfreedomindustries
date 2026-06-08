'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { useForm, Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useCheckout } from '../checkout-provider';
import { setShippingAddress, createCustomerAddress } from '../actions';
import { CountrySelect } from '@/components/shared/country-select';
import {useTranslations} from 'next-intl';

interface ShippingAddressStepProps {
  onComplete: () => void;
}

interface AddressFormData {
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  assignedStation?: string;
  rank?: string;
  assignedStationRank?: string;
}

export default function ShippingAddressStep({ onComplete }: ShippingAddressStepProps) {
  const t = useTranslations('Checkout');
  const router = useRouter();
  const { addresses, countries, order, isGuest } = useCheckout();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    if (order.shippingAddress) {
      const matchingAddress = addresses.find(
        (a) =>
          a.streetLine1 === order.shippingAddress?.streetLine1 &&
          a.postalCode === order.shippingAddress?.postalCode
      );
      if (matchingAddress) return matchingAddress.id;
    }
    const defaultAddress = addresses.find((a) => a.defaultShippingAddress);
    return defaultAddress?.id || null;
  });
  const [dialogOpen, setDialogOpen] = useState(addresses.length === 0 && !isGuest);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useSameForBilling, setUseSameForBilling] = useState(true);

  const customerFullName = order.customer
    ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
    : '';

  const buildAddressInput = (data: AddressFormData) => ({
    fullName: customerFullName || order.shippingAddress?.fullName || 'Customer',
    company: [data.assignedStation?.trim(), data.rank?.trim()].filter(Boolean).join(' — ') || '',
    streetLine1: data.streetLine1,
    streetLine2: data.streetLine2 || '',
    city: data.city,
    province: data.province,
    postalCode: data.postalCode,
    countryCode: data.countryCode,
    phoneNumber: data.phoneNumber,
  });

  const getDefaultFormValues = (): Partial<AddressFormData> => {
    if (isGuest && order.shippingAddress?.streetLine1) {
      return {
        streetLine1: order.shippingAddress.streetLine1 || '',
        streetLine2: order.shippingAddress.streetLine2 || '',
        city: order.shippingAddress.city || '',
        province: order.shippingAddress.province || '',
        postalCode: order.shippingAddress.postalCode || '',
        countryCode: countries.find(c => c.name === order.shippingAddress?.country)?.code || countries[0]?.code || 'US',
        phoneNumber: order.shippingAddress.phoneNumber || order.customer?.phoneNumber || '',
        assignedStation: order.shippingAddress.company || '',
        rank: '',
      };
    }
    return {
      countryCode: countries[0]?.code || 'US',
      phoneNumber: order.customer?.phoneNumber || '',
    };
  };

  const { register, handleSubmit, formState: { errors }, reset, control } = useForm<AddressFormData>({
    defaultValues: getDefaultFormValues()
  });

  const handleSelectExistingAddress = async () => {
    if (!selectedAddressId) return;

    setLoading(true);
    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddress) return;

      await setShippingAddress({
        fullName: selectedAddress.fullName || '',
        company: selectedAddress.company || '',
        streetLine1: selectedAddress.streetLine1,
        streetLine2: selectedAddress.streetLine2 || '',
        city: selectedAddress.city || '',
        province: selectedAddress.province || '',
        postalCode: selectedAddress.postalCode || '',
        countryCode: selectedAddress.country.code,
        phoneNumber: selectedAddress.phoneNumber || '',
      }, useSameForBilling);

      router.refresh();
      onComplete();
    } catch (error) {
      console.error('Error setting address:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSaveNewAddress = async (data: AddressFormData) => {
    setSaving(true);
    try {
      const newAddress = await createCustomerAddress(buildAddressInput(data));
      setDialogOpen(false);
      reset();
      router.refresh();
      setSelectedAddressId(newAddress.id);
    } catch (error) {
      console.error('Error creating address:', error);
      alert(`Error creating address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const onSubmitGuestAddress = async (data: AddressFormData) => {
    setLoading(true);
    try {
      await setShippingAddress(buildAddressInput(data), useSameForBilling);
      router.refresh();
      onComplete();
    } catch (error) {
      console.error('Error setting address:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isGuest) {
    return (
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmitGuestAddress)}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field className="col-span-2">
                <FieldLabel htmlFor="streetLine1">{t('streetAddress')}</FieldLabel>
                <Input
                  id="streetLine1"
                  {...register('streetLine1', { required: t('streetRequired') })}
                />
                <FieldError>{errors.streetLine1?.message}</FieldError>
              </Field>

              <Field className="col-span-2">
                <FieldLabel htmlFor="streetLine2">{t('apartment')}</FieldLabel>
                <Input id="streetLine2" {...register('streetLine2')} />
              </Field>

              <Field>
                <FieldLabel htmlFor="city">{t('city')}</FieldLabel>
                <Input
                  id="city"
                  {...register('city', { required: t('cityRequired') })}
                />
                <FieldError>{errors.city?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="province">{t('stateProvince')}</FieldLabel>
                <Input
                  id="province"
                  {...register('province')}
                />
                <FieldError>{errors.province?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="postalCode">{t('postalCode')}</FieldLabel>
                <Input
                  id="postalCode"
                  {...register('postalCode', { required: t('postalCodeRequired') })}
                />
                <FieldError>{errors.postalCode?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="countryCode">{t('country')}</FieldLabel>
                <Controller
                  name="countryCode"
                  control={control}
                  rules={{ required: t('countryRequired') }}
                  render={({ field }) => (
                    <CountrySelect
                      countries={countries}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <FieldError>{errors.countryCode?.message}</FieldError>
              </Field>

              <Field className="col-span-2">
                <FieldLabel htmlFor="phoneNumber">{t('phoneNumber')}</FieldLabel>
                <Input
                  id="phoneNumber"
                  type="tel"
                  {...register('phoneNumber', { required: t('phoneRequired') })}
                />
                <FieldError>{errors.phoneNumber?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="assignedStation">{t('assignedStation')}</FieldLabel>
                <Input
                  id="assignedStation"
                  {...register('assignedStation')}
                />
                <FieldError>{errors.assignedStation?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="rank">{t('rank')}</FieldLabel>
                <Input
                  id="rank"
                  {...register('rank')}
                />
                <FieldError>{errors.rank?.message}</FieldError>
              </Field>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="same-billing-guest"
                checked={useSameForBilling}
                onCheckedChange={(checked) => setUseSameForBilling(checked === true)}
              />
              <label
                htmlFor="same-billing-guest"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('useSameForBilling')}
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('continue')}
            </Button>
          </FieldGroup>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {addresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">{t('selectSavedAddress')}</h3>
          <RadioGroup value={selectedAddressId || ''} onValueChange={setSelectedAddressId}>
            {addresses.map((address) => (
              <div key={address.id} className="flex items-start space-x-3">
                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                  <Card className="p-4">
                    <div className="leading-tight space-y-0">
                      <p className="text-sm text-muted-foreground">
                        {address.streetLine1}
                        {address.streetLine2 && `, ${address.streetLine2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.province} {address.postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.country.name}</p>
                      <p className="text-sm text-muted-foreground">{address.phoneNumber}</p>
                      {address.company && (
                        <p className="text-sm text-muted-foreground">
                          {t('assignedStationRank')}: {address.company}
                        </p>
                      )}
                    </div>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="same-billing"
              checked={useSameForBilling}
              onCheckedChange={(checked) => setUseSameForBilling(checked === true)}
            />
            <label
              htmlFor="same-billing"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('useSameForBilling')}
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSelectExistingAddress}
              disabled={!selectedAddressId || loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('continueWithSelected')}
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button type="button" variant="outline" />}>
                {t('addNewAddress')}
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit(onSaveNewAddress)}>
                  <DialogHeader>
                    <DialogTitle>{t('addNewAddress')}</DialogTitle>
                    <DialogDescription>
                      {t('addNewAddressDescription')}
                    </DialogDescription>
                  </DialogHeader>

                  <FieldGroup className="my-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Field className="col-span-2">
                        <FieldLabel htmlFor="assignedStationRank">{t('assignedStationRank')}</FieldLabel>
                        <Input
                          id="assignedStationRank"
                          {...register('assignedStationRank')}
                        />
                        <FieldError>{errors.assignedStationRank?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="streetLine1">{t('streetAddress')}</FieldLabel>
                        <Input
                          id="streetLine1"
                          {...register('streetLine1', { required: t('streetRequired') })}
                        />
                        <FieldError>{errors.streetLine1?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="streetLine2">{t('apartment')}</FieldLabel>
                        <Input id="streetLine2" {...register('streetLine2')} />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="city">{t('cityLabel')}</FieldLabel>
                        <Input
                          id="city"
                          {...register('city')}
                        />
                        <FieldError>{errors.city?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="province">{t('stateProvince')}</FieldLabel>
                        <Input
                          id="province"
                          {...register('province')}
                        />
                        <FieldError>{errors.province?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="postalCode">{t('postalCodeLabel')}</FieldLabel>
                        <Input
                          id="postalCode"
                          {...register('postalCode')}
                        />
                        <FieldError>{errors.postalCode?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="countryCode">{t('country')}</FieldLabel>
                        <Controller
                          name="countryCode"
                          control={control}
                          rules={{ required: t('countryRequired') }}
                          render={({ field }) => (
                            <CountrySelect
                              countries={countries}
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={saving}
                            />
                          )}
                        />
                        <FieldError>{errors.countryCode?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="phoneNumber">{t('phoneNumberLabel')}</FieldLabel>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          {...register('phoneNumber')}
                        />
                        <FieldError>{errors.phoneNumber?.message}</FieldError>
                      </Field>
                    </div>
                  </FieldGroup>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                      {t('cancel')}
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('saveAddress')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {addresses.length === 0 && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button type="button" className="w-full" />}>
            {t('addShippingAddress')}
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit(onSaveNewAddress)}>
              <DialogHeader>
                <DialogTitle>{t('addShippingAddress')}</DialogTitle>
                <DialogDescription>
                  {t('addShippingAddressDescription')}
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="my-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="assignedStationRank">{t('assignedStationRank')}</FieldLabel>
                    <Input
                      id="assignedStationRank"
                      {...register('assignedStationRank')}
                    />
                    <FieldError>{errors.assignedStationRank?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="streetLine1">{t('streetAddress')}</FieldLabel>
                    <Input
                      id="streetLine1"
                      {...register('streetLine1', { required: t('streetRequired') })}
                    />
                    <FieldError>{errors.streetLine1?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="streetLine2">{t('apartment')}</FieldLabel>
                    <Input id="streetLine2" {...register('streetLine2')} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="city">{t('cityLabel')}</FieldLabel>
                    <Input
                      id="city"
                      {...register('city')}
                    />
                    <FieldError>{errors.city?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="province">{t('stateProvince')}</FieldLabel>
                    <Input
                      id="province"
                      {...register('province')}
                    />
                    <FieldError>{errors.province?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="postalCode">{t('postalCodeLabel')}</FieldLabel>
                    <Input
                      id="postalCode"
                      {...register('postalCode')}
                    />
                    <FieldError>{errors.postalCode?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="countryCode">{t('country')}</FieldLabel>
                    <Controller
                      name="countryCode"
                      control={control}
                      rules={{ required: t('countryRequired') }}
                      render={({ field }) => (
                        <CountrySelect
                          countries={countries}
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={saving}
                        />
                      )}
                    />
                    <FieldError>{errors.countryCode?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="phoneNumber">{t('phoneNumberLabel')}</FieldLabel>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      {...register('phoneNumber')}
                    />
                    <FieldError>{errors.phoneNumber?.message}</FieldError>
                  </Field>
                </div>
              </FieldGroup>

              <DialogFooter>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('saveAddress')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
