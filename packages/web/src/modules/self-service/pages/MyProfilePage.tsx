import { useMutation, useQuery } from '@apollo/client';
import {
  IconArrowLeft,
  IconCamera,
  IconDeviceFloppy,
  IconLoader2,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { OnboardingCard } from '../../../components/onboarding/OnboardingFlow';
import { useTheme } from '../../../providers/theme/useTheme';
import {
  MY_PROFILE_QUERY,
  UPDATE_MY_EMPLOYEE_PHOTO_MUTATION,
  UPDATE_MY_EMPLOYEE_PROFILE_MUTATION,
} from '../graphql/self-service.operations';

type MyEmployee = {
  readonly id: string;
  readonly employeeNumber: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly workEmail: string | null;
  readonly employmentStatus: string;
  readonly currentAssignment: {
    readonly departmentName: string | null;
    readonly positionTitle: string | null;
  } | null;
};

type MyProfile = {
  readonly employeeId: string;
  readonly photoUrl: string | null;
  readonly personalEmail: string | null;
  readonly phone: string | null;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly countryCode: string | null;
  readonly postalCode: string | null;
  readonly permanentAddressLine1: string | null;
  readonly permanentAddressLine2: string | null;
  readonly permanentCity: string | null;
  readonly permanentRegion: string | null;
  readonly permanentCountryCode: string | null;
  readonly permanentPostalCode: string | null;
  readonly currentAccommodationType: string | null;
  readonly permanentAccommodationType: string | null;
  readonly preferredContactChannel: string | null;
  readonly emergencyContactName: string | null;
  readonly emergencyContactPhone: string | null;
  readonly emergencyContactRelation: string | null;
};

type MyProfileData = {
  readonly myEmployee: MyEmployee;
  readonly myEmployeeProfile: MyProfile | null;
};

type ProfileForm = Omit<MyProfile, 'employeeId' | 'photoUrl'> extends infer T
  ? { [K in keyof T]-?: string }
  : never;

const EMPTY_PROFILE: ProfileForm = {
  personalEmail: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  countryCode: '',
  postalCode: '',
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentCity: '',
  permanentRegion: '',
  permanentCountryCode: '',
  permanentPostalCode: '',
  currentAccommodationType: '',
  permanentAccommodationType: '',
  preferredContactChannel: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
};

const profileFrom = (profile: MyProfile | null): ProfileForm =>
  Object.fromEntries(
    Object.keys(EMPTY_PROFILE).map((key) => [
      key,
      (profile?.[key as keyof MyProfile] as string | null | undefined) ?? '',
    ]),
  ) as ProfileForm;

const ACCOMMODATION_OPTIONS = ['owned', 'rented', 'family', 'company', 'hostel'] as const;
const CONTACT_CHANNELS = ['email', 'phone', 'whatsapp'] as const;

const MAX_PHOTO_BYTES = 300_000;

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

export const MyProfilePage = () => {
  const { theme } = useTheme();
  const { data, loading, refetch } = useQuery<MyProfileData>(MY_PROFILE_QUERY);
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_MY_EMPLOYEE_PROFILE_MUTATION);
  const [updatePhoto, { loading: savingPhoto }] = useMutation(UPDATE_MY_EMPLOYEE_PHOTO_MUTATION);

  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profile = data?.myEmployeeProfile ?? null;
  const employee = data?.myEmployee ?? null;

  useEffect(() => {
    setForm(profileFrom(profile));
  }, [profile]);

  const setField = (key: keyof ProfileForm, value: string): void =>
    setForm((current) => ({ ...current, [key]: value }));

  const initials = useMemo(
    () =>
      employee
        ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase()
        : '',
    [employee],
  );

  const onChangePhoto = (file: File): void => {
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Image must be under 300 KB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      void updatePhoto({ variables: { input: { photoUrl: String(reader.result) } } })
        .then(() => refetch())
        .then(() => setNotice('Photo updated'))
        .catch((caught: unknown) =>
          setError(caught instanceof Error ? caught.message : 'Could not save photo'),
        );
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setNotice(null);
    setError(null);
    try {
      await updateProfile({
        variables: {
          input: Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, value || null]),
          ),
        },
      });
      await refetch();
      setNotice('Profile updated');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your profile');
    }
  };

  if (loading && !employee) {
    return (
      <main className="profile-page">
        <p className="page-subtitle">Loading your profile...</p>
      </main>
    );
  }

  return (
    <form className="profile-page profile-page-narrow" onSubmit={(event) => void onSubmit(event)}>
      <Link className="profile-back" to="/me">
        <IconArrowLeft size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        My workspace
      </Link>

      <div className="profile-frame">
        <aside className="profile-identity" aria-label="Your identity">
          <div className="employee-photo-slot">
            {profile?.photoUrl ? (
              <img alt="Your profile" className="employee-identity-photo" src={profile.photoUrl} />
            ) : (
              <span className="employee-avatar" style={{ '--chip-color': 'var(--hrms-color-tag-violet)' } as React.CSSProperties}>
                {initials}
              </span>
            )}
            <label
              className={`employee-photo-edit${savingPhoto ? ' is-saving' : ''}`}
              htmlFor="my-photo-input"
              title={savingPhoto ? 'Saving photo...' : 'Change photo'}
            >
              {savingPhoto ? (
                <IconLoader2
                  className="icon-spin"
                  size={theme.icon.size.sm}
                  stroke={theme.icon.stroke.sm}
                />
              ) : (
                <IconCamera size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
              )}
              <input
                accept="image/*"
                disabled={savingPhoto}
                id="my-photo-input"
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onChangePhoto(file);
                  event.target.value = '';
                }}
              />
            </label>
          </div>

          <h1 className="profile-name">
            {employee ? `${employee.firstName} ${employee.lastName}` : 'Your profile'}
          </h1>
          <div className="employee-meta">{employee?.employeeNumber}</div>

          <div className="field-list profile-identity-facts">
            <div className="field-row">
              <span className="field-label">Role</span>
              <span className="field-value">
                {employee?.currentAssignment?.positionTitle ?? '—'}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Department</span>
              <span className="field-value">
                {employee?.currentAssignment?.departmentName ?? '—'}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Work email</span>
              <span className="field-value">{employee?.workEmail ?? '—'}</span>
            </div>
          </div>

          <p className="field-hint">
            Your name, employee number, and work email are maintained by HR. Everything on the right
            is yours to keep current.
          </p>
        </aside>

        <section className="profile-content">
          {notice ? <p className="form-success">{notice}</p> : null}
          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}

          <OnboardingCard note="How your team reaches you outside work email." title="Contact">
            <div className="onboarding-field-pair">
              <div className="field">
                <label htmlFor="profile-email">Personal email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={form.personalEmail}
                  onChange={(event) => setField('personalEmail', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-phone">Phone</label>
                <input
                  id="profile-phone"
                  value={form.phone}
                  onChange={(event) => setField('phone', event.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="profile-channel">Preferred contact channel</label>
              <select
                id="profile-channel"
                value={form.preferredContactChannel}
                onChange={(event) => setField('preferredContactChannel', event.target.value)}
              >
                <option value="">Not set</option>
                {CONTACT_CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {titleCase(channel)}
                  </option>
                ))}
              </select>
            </div>
          </OnboardingCard>

          <OnboardingCard note="Where you currently live." title="Current address">
            <div className="field">
              <label htmlFor="profile-address-1">Address</label>
              <input
                id="profile-address-1"
                value={form.addressLine1}
                onChange={(event) => setField('addressLine1', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="profile-address-2">Address line 2</label>
              <input
                id="profile-address-2"
                value={form.addressLine2}
                onChange={(event) => setField('addressLine2', event.target.value)}
              />
            </div>
            <div className="onboarding-field-pair">
              <div className="field">
                <label htmlFor="profile-city">City</label>
                <input
                  id="profile-city"
                  value={form.city}
                  onChange={(event) => setField('city', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-region">Region</label>
                <input
                  id="profile-region"
                  value={form.region}
                  onChange={(event) => setField('region', event.target.value)}
                />
              </div>
            </div>
            <div className="onboarding-field-pair is-code-first">
              <div className="field">
                <label htmlFor="profile-country">Country code</label>
                <input
                  id="profile-country"
                  maxLength={2}
                  value={form.countryCode}
                  onChange={(event) => setField('countryCode', event.target.value.toUpperCase())}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-postal">Postal code</label>
                <input
                  id="profile-postal"
                  value={form.postalCode}
                  onChange={(event) => setField('postalCode', event.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="profile-accommodation">Accommodation</label>
              <select
                id="profile-accommodation"
                value={form.currentAccommodationType}
                onChange={(event) => setField('currentAccommodationType', event.target.value)}
              >
                <option value="">Not set</option>
                {ACCOMMODATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {titleCase(option)}
                  </option>
                ))}
              </select>
            </div>
          </OnboardingCard>

          <OnboardingCard
            note="Your permanent or home-town address, if it differs from above."
            title="Permanent address"
          >
            <div className="field">
              <label htmlFor="profile-perm-address-1">Address</label>
              <input
                id="profile-perm-address-1"
                value={form.permanentAddressLine1}
                onChange={(event) => setField('permanentAddressLine1', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="profile-perm-address-2">Address line 2</label>
              <input
                id="profile-perm-address-2"
                value={form.permanentAddressLine2}
                onChange={(event) => setField('permanentAddressLine2', event.target.value)}
              />
            </div>
            <div className="onboarding-field-pair">
              <div className="field">
                <label htmlFor="profile-perm-city">City</label>
                <input
                  id="profile-perm-city"
                  value={form.permanentCity}
                  onChange={(event) => setField('permanentCity', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-perm-region">Region</label>
                <input
                  id="profile-perm-region"
                  value={form.permanentRegion}
                  onChange={(event) => setField('permanentRegion', event.target.value)}
                />
              </div>
            </div>
            <div className="onboarding-field-pair is-code-first">
              <div className="field">
                <label htmlFor="profile-perm-country">Country code</label>
                <input
                  id="profile-perm-country"
                  maxLength={2}
                  value={form.permanentCountryCode}
                  onChange={(event) =>
                    setField('permanentCountryCode', event.target.value.toUpperCase())
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="profile-perm-postal">Postal code</label>
                <input
                  id="profile-perm-postal"
                  value={form.permanentPostalCode}
                  onChange={(event) => setField('permanentPostalCode', event.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="profile-perm-accommodation">Accommodation</label>
              <select
                id="profile-perm-accommodation"
                value={form.permanentAccommodationType}
                onChange={(event) => setField('permanentAccommodationType', event.target.value)}
              >
                <option value="">Not set</option>
                {ACCOMMODATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {titleCase(option)}
                  </option>
                ))}
              </select>
            </div>
          </OnboardingCard>

          <OnboardingCard note="Who we call if something happens at work." title="Emergency contact">
            <div className="field">
              <label htmlFor="profile-emergency-name">Name</label>
              <input
                id="profile-emergency-name"
                value={form.emergencyContactName}
                onChange={(event) => setField('emergencyContactName', event.target.value)}
              />
            </div>
            <div className="onboarding-field-pair">
              <div className="field">
                <label htmlFor="profile-emergency-phone">Phone</label>
                <input
                  id="profile-emergency-phone"
                  value={form.emergencyContactPhone}
                  onChange={(event) => setField('emergencyContactPhone', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-emergency-relation">Relationship</label>
                <input
                  id="profile-emergency-relation"
                  value={form.emergencyContactRelation}
                  onChange={(event) => setField('emergencyContactRelation', event.target.value)}
                />
              </div>
            </div>
          </OnboardingCard>
        </section>
      </div>

      <footer className="onboarding-flow-footer">
        <span className="onboarding-flow-progress">Changes save to your employee record.</span>
        <div className="page-actions">
          <Link className="button button-secondary" to="/me">
            Cancel
          </Link>
          <button className="button button-primary" disabled={saving} type="submit">
            <IconDeviceFloppy size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </footer>
    </form>
  );
};
