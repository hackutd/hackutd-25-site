import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Formik, Form, useFormikContext } from 'formik';
import Link from 'next/link';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { GetServerSideProps } from 'next';
import { Snackbar } from '@mui/material';

import { NavbarCallbackRegistryContext } from '@/lib/context/navbar';
import { useAuthContext } from '@/lib/user/AuthContext';
import { getFileExtension } from '@/lib/util';
import { RequestHelper } from '@/lib/request-helper';
import { generateInitialValues, hackPortalConfig } from '@/hackportal.config';

import Loading from '@/components/icon/Loading';
import DisplayRegistrationQuestion from '@/components/register/DisplayRegistrationQuestion';
// TODO: refactor this page

interface Props {
  allowedRegistrations: boolean;
}

function ApplicationAutosaveHandler({
  currentPage,
  updatePartialProfile,
  resumeFile,
  defaultResumeUrl,
}: {
  currentPage: number;
  updatePartialProfile: (p: PartialRegistration) => void;
  resumeFile: File | null;
  defaultResumeUrl: string;
}) {
  const { values, dirty, resetForm } = useFormikContext<PartialRegistration>();
  const { setCallback, removeCallback } = useContext(NavbarCallbackRegistryContext);
  const { user } = useAuthContext();
  const router = useRouter();
  useEffect(() => {
    if (dirty || resumeFile) {
      setCallback(router.pathname, async () => {
        let resumeUrl = defaultResumeUrl;
        if (resumeFile) {
          const formData = new FormData();
          formData.append('resume', resumeFile);
          formData.append('fileName', `${user.id}${getFileExtension(resumeFile.name)}`);
          formData.append('studyLevel', values['studyLevel']);
          formData.append('major', values['major']);
          formData.append('isPartialProfile', 'true');

          const res = await fetch('/api/resume/upload', {
            method: 'post',
            body: formData,
          });
          resumeUrl = (await res.json()).url;
        }
        return RequestHelper.put<any, { msg: string; registrationData: PartialRegistration }>(
          '/api/applications/save',
          {},
          {
            ...values,
            id: values.id || user.id,
            currentRegistrationPage: currentPage,
            resume: resumeUrl,
          },
        )
          .then(({ data }) => {
            resetForm({ values });
            updatePartialProfile(data.registrationData);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      removeCallback(router.pathname);
    }
    return () => {
      removeCallback(router.pathname);
    };
  }, [dirty, values, resumeFile]);
  return null;
}
/**
 * The registration page.
 *
 * Registration: /
 */

export default function Register({ allowedRegistrations }: Props) {
  const router = useRouter();

  const {
    registrationFields: {
      generalQuestions,
      schoolQuestions,
      hackathonExperienceQuestions,
      shortAnswerQuestions,
      eventInfoQuestions,
      sponsorInfoQuestions,
      teammateQuestions,
    },
  } = hackPortalConfig;

  const { user, profile, partialProfile, hasProfile, updateProfile, updatePartialProfile } =
    useAuthContext();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSavingApplication, setIsSavingApplication] = useState(false);
  const [resumeFileUpdated, setResumeFileUpdated] = useState(false);
  const resumeFileRef = useRef(null);
  const [displayProfileSavedToaster, setDisplayProfileSavedToaster] = useState(false);
  // update this to false for testing
  const [loading, setLoading] = useState(false);
  const [registrationSection, setRegistrationSection] = useState(
    partialProfile?.currentRegistrationPage || 0,
  );
  const checkRedirect = async () => {
    if (!allowedRegistrations) return;
    if (hasProfile) router.push('/profile');
    if (user) setLoading(false);
  };

  // disable this for testing
  useEffect(() => {
    checkRedirect();
  }, [user]);

  const cleanData = (registrationData: PartialRegistration): Registration => {
    let cleanedValues = { ...registrationData };
    const userValues = {
      id: registrationData.id,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      preferredEmail: registrationData.preferredEmail,
      permissions: registrationData.permissions,
    };
    delete cleanedValues.firstName;
    delete cleanedValues.lastName;
    delete cleanedValues.permissions;
    delete cleanedValues.preferredEmail;
    return {
      ...cleanedValues,
      user: userValues,
    };
  };

  const handleSubmit = async (registrationData) => {
    registrationData = cleanData(registrationData);
    if (registrationData['university'] === 'Other') {
      registrationData['university'] = registrationData['universityManual'];
    }

    if (registrationData['major'] === 'Other') {
      registrationData['major'] = registrationData['majorManual'];
    }

    if (registrationData['heardFrom'] === 'Other') {
      registrationData['heardFrom'] = registrationData['heardFromManual'];
    }

    delete registrationData.universityManual;
    delete registrationData.majorManual;
    delete registrationData.heardFromManual;
    let resumeUrl: string = partialProfile?.resume || '';
    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('fileName', `${user.id}${getFileExtension(resumeFile.name)}`);
        formData.append('studyLevel', registrationData['studyLevel']);
        formData.append('major', registrationData['major']);

        const res = await fetch('/api/resume/upload', {
          method: 'post',
          body: formData,
        });
        resumeUrl = (await res.json()).url;
      } else if (resumeUrl !== '') {
        const { data } = await RequestHelper.post<
          { major: string; studyLevel: string; resumeUrl: string },
          { url: string }
        >(
          '/api/resume/move',
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
          {
            major: registrationData.major,
            studyLevel: registrationData.studyLevel,
            resumeUrl,
          },
        );
        resumeUrl = data.url;
      }
      const { data } = await RequestHelper.post<
        Registration,
        { msg: string; registrationData: Registration }
      >(
        '/api/applications',
        {},
        {
          ...registrationData,
          id: registrationData.id || user.id,
          user: {
            ...registrationData.user,
            id: registrationData.user.id || user.id,
          },
          resume: resumeUrl,
        },
      );
      alert('Application Submitted');
      updateProfile(data.registrationData);
      updatePartialProfile(null);
      router.push('/profile');
    } catch (error) {
      console.error(error);
      console.log('Request creation error');
    }
  };

  const isValidUSPhoneNumber = (phoneNumber: string) => {
    return /^(1[ -]?)?\d{3}[ -]?\d{3}[ -]?\d{4}$/.test(phoneNumber);
  };

  const isValidInternationalPhoneNumber = (phoneNumber: string) => {
    return /(\+|00)(297|93|244|1264|358|355|376|971|54|374|1684|1268|61|43|994|257|32|229|226|880|359|973|1242|387|590|375|501|1441|591|55|1246|673|975|267|236|1|61|41|56|86|225|237|243|242|682|57|269|238|506|53|5999|61|1345|357|420|49|253|1767|45|1809|1829|1849|213|593|20|291|212|34|372|251|358|679|500|33|298|691|241|44|995|44|233|350|224|590|220|245|240|30|1473|299|502|594|1671|592|852|504|385|509|36|62|44|91|246|353|98|964|354|972|39|1876|44|962|81|76|77|254|996|855|686|1869|82|383|965|856|961|231|218|1758|423|94|266|370|352|371|853|590|212|377|373|261|960|52|692|389|223|356|95|382|976|1670|258|222|1664|596|230|265|60|262|264|687|227|672|234|505|683|31|47|977|674|64|968|92|507|64|51|63|680|675|48|1787|1939|850|351|595|970|689|974|262|40|7|250|966|249|221|65|500|4779|677|232|503|378|252|508|381|211|239|597|421|386|46|268|1721|248|963|1649|235|228|66|992|690|993|670|676|1868|216|90|688|886|255|256|380|598|1|998|3906698|379|1784|58|1284|1340|84|678|681|685|967|27|260|263)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{4,20}$/.test(
      phoneNumber.replaceAll(' ', ''),
    );
  };

  const handleSaveProfile = (
    registrationData: PartialRegistration,
    nextPage: number,
    resetForm: (param: { values: any }) => void,
  ) => {
    // const cleanedData = cleanData(registrationData);
    return (async () => {
      if (resumeFile && resumeFileUpdated) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('fileName', `${user.id}${getFileExtension(resumeFile.name)}`);
        formData.append('studyLevel', registrationData['studyLevel']);
        formData.append('major', registrationData['major']);
        formData.append('isPartialProfile', 'true');

        const res = await fetch('/api/resume/upload', {
          method: 'post',
          body: formData,
        });
        const resumeUrl = (await res.json()).url;
        return resumeUrl;
      } else {
        return partialProfile?.resume || '';
      }
    })()
      .then((resumeUrl: string) => {
        return RequestHelper.put<any, { msg: string; registrationData: PartialRegistration }>(
          '/api/applications/save',
          {},
          {
            ...registrationData,
            id: registrationData.id || user.id,
            currentRegistrationPage: nextPage,
            resume: resumeUrl,
          },
        )
          .then(() => {
            setDisplayProfileSavedToaster(true);
            resetForm({ values: registrationData });
            setResumeFileUpdated(false);
            updatePartialProfile(registrationData);
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        alert('something is wrong with saving profile');
        console.error(err);
      });
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files.length !== 1) return alert('Must submit one file');

    const file = e.target.files[0];

    const fileExtension = getFileExtension(file.name);

    const acceptedFileExtensions = [
      '.pdf',
      '.doc',
      '.docx',
      '.png',
      '.jpg',
      '.jpeg',
      '.txt',
      '.tex',
      '.rtf',
    ];

    if (!acceptedFileExtensions.includes(fileExtension))
      return alert(`Accepted file types: ${acceptedFileExtensions.join(' ')}`);

    setResumeFile(file);
    setResumeFileUpdated(true);
  };

  if (!allowedRegistrations) {
    return (
      <h1 className="mx-auto text-2xl mt-4 font-bold">
        Registrations is closed and no longer allowed
      </h1>
    );
  }

  // disable this for testing
  if (!user) {
    // If user haven't signed in, redirect them to login page
    router.push('/auth');
  }

  if (loading) {
    return <Loading width={200} height={200} />;
  }

  //disables submitting form on enter key press
  function onKeyDown(keyEvent) {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  }

  const setErrors = (obj, values, errors) => {
    if (obj.textInputQuestions)
      for (let inputObj of obj.textInputQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name]) errors[inputObj.name] = 'Required';
        }
      }
    if (obj.numberInputQuestions)
      for (let inputObj of obj.numberInputQuestions) {
        if (inputObj.required) {
          if (isNaN(parseInt(values[inputObj.name]))) {
            errors[inputObj.name] = 'Invalid number';
          } else if (!values[inputObj.name] && values[inputObj.name] !== 0)
            errors[inputObj.name] = 'Required';
        }
      }
    if (obj.dropdownQuestions)
      for (let inputObj of obj.dropdownQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name]) errors[inputObj.name] = 'Required';
        }
      }
    if (obj.checkboxQuestions)
      for (let inputObj of obj.checkboxQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name] || values[inputObj.name].length === 0)
            errors[inputObj.name] = 'Required';
        }
      }
    if (obj.datalistQuestions)
      for (let inputObj of obj.datalistQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name]) errors[inputObj.name] = 'Required';
        }
      }
    if (obj.textAreaQuestions)
      for (let inputObj of obj.textAreaQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name]) errors[inputObj.name] = 'Required';
        }
      }

    return errors;
  };

  // Function to validate current page
  const validateCurrentPage = (values) => {
    let errors = {};

    switch (registrationSection) {
      case 0: // General Questions
        for (let obj of generalQuestions) {
          errors = setErrors(obj, values, errors);
        }
        break;
      case 1: // Travel Reimbursement (no required fields)
        break;
      case 2: // School Questions
        for (let obj of schoolQuestions) {
          errors = setErrors(obj, values, errors);
        }
        // Check manual fields if "Other" is selected
        if (values['major'] === 'Other' && !values['majorManual']) {
          errors['majorManual'] = 'Required';
        }
        if (values['university'] === 'Other' && !values['universityManual']) {
          errors['universityManual'] = 'Required';
        }
        break;
      case 3: // Hackathon Experience
        for (let obj of hackathonExperienceQuestions) {
          errors = setErrors(obj, values, errors);
        }
        if (values['heardFrom'] === 'Other' && !values['heardFromManual']) {
          errors['heardFromManual'] = 'Required';
        }
        break;
      case 4: // Short Answer Questions
        for (let obj of shortAnswerQuestions) {
          errors = setErrors(obj, values, errors);
        }
        break;
      case 5: // Event Info
        for (let obj of eventInfoQuestions) {
          errors = setErrors(obj, values, errors);
        }
        break;
      case 6: // Sponsor Info (resume is optional)
        for (let obj of sponsorInfoQuestions) {
          errors = setErrors(obj, values, errors);
        }
        break;
      case 7: // Teammate Questions
        for (let obj of teammateQuestions) {
          errors = setErrors(obj, values, errors);
        }
        break;
    }

    return Object.keys(errors).length === 0;
  };

  return (
    <div
      className="flex flex-col flex-grow mt-0 mb-0"
      style={{
        backgroundImage: 'url(/assets/registration-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      <Head>
        <title>Hacker Application</title>
        <meta name="description" content="Register for HackPortal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Formik
        initialValues={{
          ...generateInitialValues(partialProfile),
          id: partialProfile?.id || '',
          firstName: partialProfile?.firstName || '',
          lastName: partialProfile?.lastName || '',
          preferredEmail: partialProfile?.preferredEmail || user?.preferredEmail || '',
          majorManual: partialProfile?.majorManual || '',
          universityManual: partialProfile?.universityManual || '',
          heardFromManual: partialProfile?.heardFromManual || '',
          resume: partialProfile?.resume || '',
        }}
        validateOnBlur={false}
        validateOnChange={false}
        //validation
        //Get condition in which values.[value] is invalid and set error message in errors.[value]. Value is a value from the form(look at initialValues)
        validate={(values) => {
          var errors: any = {};
          for (let obj of generalQuestions) {
            errors = setErrors(obj, values, errors);
          }
          for (let obj of schoolQuestions) {
            errors = setErrors(obj, values, errors);
          }
          for (let obj of hackathonExperienceQuestions) {
            errors = setErrors(obj, values, errors);
          }
          for (let obj of shortAnswerQuestions) {
            errors = setErrors(obj, values, errors);
          }
          for (let obj of eventInfoQuestions) {
            errors = setErrors(obj, values, errors);
          }
          for (let obj of sponsorInfoQuestions) {
            errors = setErrors(obj, values, errors);
          }
          for (let obj of teammateQuestions) {
            errors = setErrors(obj, values, errors);
          }

          if (
            !isValidUSPhoneNumber(values['phoneNumber']) &&
            !isValidInternationalPhoneNumber(values['phoneNumber'])
          ) {
            errors.phoneNumber = 'Invalid phone number';
          }

          //additional custom error validation
          if (
            values.preferredEmail &&
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.preferredEmail)
          ) {
            //regex matches characters before @, characters after @, and 2 or more characters after . (domain)
            errors.preferredEmail = 'Invalid email address';
          }
          if ((values.age && values.age < 1) || values.age > 100) {
            errors.age = 'Not a valid age';
          }
          if (
            (values.hackathonExperience && values.hackathonExperience < 0) ||
            values.hackathonExperience > 100
          ) {
            errors.hackathonExperience = 'Not a valid number';
          }

          if (values['major'] === 'Other' && values['majorManual'] === '') {
            errors['majorManual'] = 'Required';
          }

          if (values['university'] === 'Other' && values['universityManual'] === '') {
            errors['universityManual'] = 'Required';
          }

          if (values['heardFrom'] === 'Other' && values['heardFromManual'] === '') {
            errors['heardFromManual'] = 'Required';
          }

          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          //submitting
          await handleSubmit(values);
          setSubmitting(false);
          // alert(JSON.stringify(values, null, 2)); //Displays form results on submit for testing purposes
        }}
      >
        {({ values, isValid, isSubmitting, dirty, resetForm }) => (
          <>
            <section className="pl-4 relative mb-4 z-[9999] hidden md:flex">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (dirty) await handleSaveProfile(values, registrationSection, resetForm);
                  await router.push('/');
                }}
              >
                <div className="mt-2 cursor-pointer items-center inline-flex text-white font-bold bg-[#2D5016] rounded-[30px] pr-4 pl-1 py-2 border-2 border-white">
                  <ChevronLeftIcon className="text-white" fontSize={'large'} />
                  Home
                </div>
              </button>
            </section>
            <section className="relative">
              {/* Field component automatically hooks input to form values. Use name attribute to match corresponding value */}
              {/* ErrorMessage component automatically displays error based on validation above. Use name attribute to match corresponding value */}
              <Form
                onKeyDown={onKeyDown}
                className="registrationForm px-4 md:px-24 w-full sm:text-base text-sm"
              >
                {/* General Questions */}
                {registrationSection == 0 && (
                  <section className="bg-white lg:w-3/5 md:w-3/4 w-full min-h-[35rem] mx-auto rounded-2xl md:py-4 py-10 px-8 mb-8 text-[#2D5016]">
                    <header>
                      <h1 className="text-[#2D5016] lg:text-4xl sm:text-3xl text-2xl font-bold text-center mt-2 md:mt-8 mb-4 poppins-bold">
                        Hacker Application
                      </h1>
                      <div
                        style={{ color: '#A6A4A8' }}
                        className="poppins-regular text-center text-md mb-4 font-light"
                      >
                        Please fill out the following fields. The application should take
                        approximately 10 minutes.
                      </div>
                    </header>
                    <div className="md:px-10">
                      <div className="flex flex-col">
                        {generalQuestions.map((obj, idx) => (
                          <DisplayRegistrationQuestion key={idx} obj={obj} />
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Travel Reimbursement Info */}
                {registrationSection == 1 && (
                  <section className="bg-white lg:w-3/5 md:w-3/4 w-full min-h-[35rem] mx-auto rounded-2xl md:py-10 py-6 px-8 mb-8 text-[#2D5016]">
                    <h2 className="sm:text-2xl text-xl sm:mb-3 mb-1 poppins-bold mt-2 text-center">
                      Before You Continue
                    </h2>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold mb-4 text-[#2D5016]">
                        Travel Reimbursement Information
                      </h3>

                      {/* Apply Section */}
                      <div className="bg-[#2D5016] p-6 rounded-lg mb-6 text-white">
                        <h4 className="text-lg font-bold mb-3">📃 Apply!</h4>
                        <p className="mb-4 text-sm leading-relaxed">
                          <strong>
                            If you are applying with a team, please make sure everyone on the team
                            applies!
                          </strong>
                        </p>
                        <div className="text-center">
                          <a
                            href="https://hackutd.notion.site/HackUTD-2025-Lost-in-the-Pages-Travel-Reimbursement-13e0d994cbb981c5a336f1dda3e5d3be"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-white text-[#2D5016] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                          >
                            View Travel Reimbursement Policy
                          </a>
                        </div>
                      </div>

                      {/* Eligibility Section */}
                      <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
                        <h4 className="text-lg font-bold mb-3 text-[#2D5016]">✅ Eligibility</h4>
                        <ul className="text-[#2D5016] space-y-3 mb-4">
                          <li className="flex items-start">
                            <span className="text-[#7A9E7E] font-bold mr-3 mt-1">•</span>
                            <span className="leading-relaxed">
                              Must be <strong>flying</strong> over <em>250 miles</em> or{' '}
                              <strong>driving</strong> over <em>50 miles</em> from UT Dallas
                              Engineering and Computer Science West (2520 Rutford Ave, Richardson,
                              TX 75080)
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#7A9E7E] font-bold mr-3 mt-1">•</span>
                            <span className="leading-relaxed">
                              Must be <strong>non-UT Dallas</strong> student
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[#7A9E7E] font-bold mr-3 mt-1">•</span>
                            <span className="leading-relaxed">
                              Submit a travel reimbursement application before the deadline (
                              <strong>October 4th 2025 @ 11:59pm CST</strong>)
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* Reimbursement Types */}
                      <div className="space-y-4 text-left">
                        {/* Gas Reimbursements */}
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                          <h4 className="text-lg font-bold mb-2 text-[#2D5016]">
                            ⛽ Gas Reimbursements
                          </h4>
                          <p className="text-sm text-[#2D5016] mb-2 leading-relaxed">
                            Gas reimbursements are usually capped at $50 per person travelling
                            depending on distance. If traveling in a group, the maximum we will
                            reimburse is $50 per person up to $200.
                          </p>
                          <p className="text-xs text-[#2D5016] font-semibold">
                            <strong>Full Reimbursements are not guaranteed.</strong>
                          </p>
                        </div>

                        {/* Bus Reimbursements */}
                        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                          <h4 className="text-lg font-bold mb-2 text-[#2D5016]">
                            🚌 Bus Reimbursements
                          </h4>
                          <p className="text-sm text-[#2D5016] mb-2 leading-relaxed">
                            We do not provide bus service from any university to our campus. If you
                            decide to take a bus (greyhound, etc.) we will reimburse the cost of the
                            bus ticket up to $50.
                          </p>
                        </div>

                        {/* Flight Reimbursements */}
                        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                          <h4 className="text-lg font-bold mb-2 text-[#2D5016]">
                            ✈️ Flight Reimbursements
                          </h4>
                          <p className="text-sm text-[#2D5016] mb-2 leading-relaxed">
                            Flight reimbursements are handled on a case by case basis. Generally
                            these reimbursements will be in the range of $50-150.{' '}
                            <em>However, more can be allotted based on team travel.</em>
                          </p>
                          <p className="text-xs text-[#2D5016] font-semibold">
                            <strong>
                              We highly recommend you apply with a team if you are requesting Flight
                              Reimbursements.
                            </strong>
                          </p>
                        </div>
                      </div>

                      {/* Important Notes */}
                      <div className="bg-yellow-50 p-4 rounded-lg mt-6 text-left border-l-4 border-yellow-400">
                        <h4 className="text-lg font-bold mb-2 text-[#2D5016]">
                          ⚖️ Important Terms
                        </h4>
                        <ul className="text-sm text-[#2D5016] space-y-1">
                          <li>
                            • All travel assistance is based on a{' '}
                            <strong>first-come-first-serve application process</strong>
                          </li>
                          <li>
                            • Travel reimbursement acceptance guarantees you and your team
                            acceptance to HackUTD
                          </li>
                          <li>
                            • We will be in touch by October 8th with a decision regarding
                            reimbursement
                          </li>
                          <li>
                            • Reimbursements will start to be processed after verifying that
                            projects were submitted and presented
                          </li>
                        </ul>
                      </div>

                      {/* Contact Info */}
                      <div className="mt-6 text-center">
                        <p className="text-sm text-[#2D5016] mb-2">
                          Questions? Contact us at{' '}
                          <a
                            href="mailto:hello@hackutd.co"
                            className="text-[#7A9E7E] hover:text-[#2D5016] underline"
                          >
                            hello@hackutd.co
                          </a>
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* School Questions */}
                {registrationSection == 2 && (
                  <section className="bg-white lg:w-3/5 md:w-3/4 w-full min-h-[35rem] mx-auto rounded-2xl md:py-10 py-6 px-8 mb-8 text-[#2D5016]">
                    <h2 className="sm:text-2xl text-xl sm:mb-3 mb-1 poppins-bold mt-2">
                      School Info
                    </h2>
                    <div className="flex flex-col md:px-4 poppins-regular ">
                      {schoolQuestions.map((obj, idx) => (
                        <DisplayRegistrationQuestion key={idx} obj={obj} />
                      ))}
                      {values['major'] === 'Other' && (
                        <DisplayRegistrationQuestion
                          key={1000}
                          obj={{
                            textInputQuestions: [
                              {
                                id: 'majorManual',
                                name: 'majorManual',
                                question: 'What is your major?',
                                required: values['major'] === 'Other',
                                initialValue: '',
                              },
                            ],
                          }}
                        />
                      )}
                      {values['university'] === 'Other' && (
                        <DisplayRegistrationQuestion
                          key={1001}
                          obj={{
                            textInputQuestions: [
                              {
                                id: 'universityManual',
                                name: 'universityManual',
                                question: 'What is your university?',
                                required: values['university'] === 'Other',
                                initialValue: '',
                              },
                            ],
                          }}
                        />
                      )}
                    </div>
                  </section>
                )}

                {/* Hackathon Questions */}
                {registrationSection == 3 && (
                  <section className="bg-white lg:w-3/5 md:w-3/4 w-full min-h-[35rem] mx-auto rounded-2xl md:py-10 py-6 px-8 mb-8 text-[#2D5016]">
                    <h2 className="sm:text-2xl text-xl poppins-bold sm:mb-3 mb-1 mt-2">
                      Hackathon Experience
                    </h2>
                    <div className="flex flex-col poppins-regular md:px-4">
                      {hackathonExperienceQuestions.map((obj, idx) => (
                        <DisplayRegistrationQuestion key={idx} obj={obj} />
                      ))}
                      {values['heardFrom'] === 'Other' && (
                        <DisplayRegistrationQuestion
                          key={1000}
                          obj={{
                            textInputQuestions: [
                              {
                                id: 'heardFromManual',
                                name: 'heardFromManual',
                                question: 'Where did you hear about HackUTD?',
                                required: values['heardFrom'] === 'Other',
                                initialValue: '',
                              },
                            ],
                          }}
                        />
                      )}
                    </div>
                  </section>
                )}

                {/* Short Answer Questions */}
                {registrationSection == 4 && (
                  <section className="bg-white lg:w-3/5 md:w-3/4 w-full min-h-[35rem] mx-auto rounded-2xl md:py-10 py-6 px-8 mb-8 text-[#2D5016]">
                    <h2 className="sm:text-2xl text-xl poppins-bold sm:mb-3 mb-1 mt-2">
                      Short Answer Questions
                    </h2>
                    <div className="flex flex-col poppins-regular md:px-4">
                      {shortAnswerQuestions.map((obj, idx) => (
                        <DisplayRegistrationQuestion key={idx} obj={obj} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Event Info Questions */}
                {registrationSection == 5 && (
                  <section className="bg-white lg:w-3/5 md:w-3/4 w-full min-h-[35rem] mx-auto rounded-2xl md:py-10 py-6 px-8 mb-8 text-[#2D5016]">
                    <h2 className="sm:text-2xl text-xl poppins-bold sm:mb-3 mb-1 mt-2">
                      Event Info
                    </h2>
                    <div className="flex flex-col poppins-regular md:px-4">
                      {eventInfoQuestions.map((obj, idx) => (
                        <DisplayRegistrationQuestion key={idx} obj={obj} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Sponsor Info Questions */}
                {registrationSection == 6 && (
                  <section className="bg-white lg:w-3/5 md:w-3/4 w-full min-h-[35rem] mx-auto rounded-2xl md:py-10 py-6 px-8 mb-8 text-[#2D5016] relative">
                    <h2 className="sm:text-2xl text-xl poppins-bold sm:mb-3 mb-1 mt-2">
                      Sponsor Info
                    </h2>
                    <div className="flex flex-col poppins-regular md:px-4">
                      {sponsorInfoQuestions.map((obj, idx) => (
                        <DisplayRegistrationQuestion key={idx} obj={obj} />
                      ))}
                    </div>
                    {/* Resume Upload */}
                    <div className="mt-8 md:px-4 poppins-regular">
                      <div className="flex items-center">
                        Upload your resume{' '}
                        <span className="text-gray-600 ml-2 text-[8px]">optional</span>
                      </div>
                      <br />
                      <input
                        onChange={(e) => handleResumeFileChange(e)}
                        ref={resumeFileRef}
                        name="resume"
                        type="file"
                        formEncType="multipart/form-data"
                        accept=".pdf, .doc, .docx, image/png, image/jpeg, .txt, .tex, .rtf"
                        className="hidden"
                      />
                      <div className="flex items-center gap-x-3 poppins-regular w-full border border-[#2D5016] rounded-md">
                        <button
                          className="md:p-2 p-1 bg-[#7A9E7E] text-white h-full rounded-l-md border-none"
                          onClick={(e) => {
                            e.preventDefault();
                            resumeFileRef.current?.click();
                          }}
                        >
                          Upload new resume...
                        </button>
                        <p className="text-[#2D5016]">
                          {resumeFile ? resumeFile.name : 'No file selected.'}
                        </p>
                      </div>
                      <p className="poppins-regular text-xs text-[#2D5016]">
                        Accepted file types: .pdf, .doc, .docx, .png, .jpeg, .txt, .tex, .rtf
                      </p>
                      {partialProfile?.resume && (
                        <div className="my-4 w-fit">
                          <Link href={partialProfile.resume} target="_blank">
                            <div className="bg-[#7A9E7E] md:p-2 p-1 text-white rounded-lg">
                              Click to view your current resume
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Teammate Questions */}
                {registrationSection == 7 && (
                  <section className="bg-white lg:w-3/5 md:w-3/4 w-full min-h-[35rem] mx-auto rounded-2xl md:py-10 py-6 px-8 mb-8 text-[#2D5016]">
                    <h2 className="sm:text-2xl text-xl font-semibold sm:mb-3 mb-1">
                      Teammate Questions
                    </h2>
                    <p className="text-md my-6 font-bold">
                      Emails of teammates should be the same as the email they registered with!
                    </p>
                    <div className="flex flex-col">
                      {teammateQuestions.map((obj, idx) => (
                        <DisplayRegistrationQuestion key={idx} obj={obj} />
                      ))}
                    </div>

                    {/* Review Submission Message */}
                    <div className="bg-green-50 p-4 rounded-lg mt-6 text-left border-l-4 border-green-400">
                      <h4 className="text-lg font-bold mb-2 text-[#2D5016]">
                        📝 Please Review Your Submission
                      </h4>
                      <p className="text-sm text-[#2D5016] leading-relaxed">
                        Before submitting your application, please take a moment to review all the
                        information you&apos;ve provided. Make sure all required fields are
                        completed and your responses accurately represent your qualifications and
                        experience.
                      </p>
                    </div>

                    {/* Application Review Process */}
                    <div className="bg-blue-50 p-4 rounded-lg mt-4 text-left border-l-4 border-blue-400">
                      <h4 className="text-lg font-bold mb-2 text-[#2D5016]">
                        📋 Application Review Process
                      </h4>
                      <p className="text-sm text-[#2D5016] leading-relaxed">
                        <strong>
                          All applications are reviewed based on the essay questions and how they
                          were answered.
                        </strong>{' '}
                        Our selection process evaluates each applicant&apos;s responses to the essay
                        questions, their thoughtfulness, creativity, and potential contribution to
                        the hackathon community.
                      </p>
                    </div>

                    {/* Submit */}
                    <div className="mt-8 text-white">
                      <button
                        disabled={isSubmitting}
                        type="submit"
                        className="mr-auto cursor-pointer px-4 py-2 rounded-lg bg-[#7A9E7E] hover:brightness-90"
                      >
                        Submit
                      </button>
                      {!isValid && (
                        <div className="text-red-600 poppins-regular">
                          Error: The form has invalid fields. Please go through the form again to
                          make sure that every required fields are filled out.
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </Form>

              {/* Pagniation buttons */}
              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                }}
                className={`lg:block ${
                  registrationSection == 0
                    ? 'justify-end'
                    : registrationSection >= 7
                    ? 'justify-start'
                    : 'justify-between'
                } lg:pb-4 pb-8 lg:px-4 sm:px-8 px-6 text-primaryDark font-semibold text-primaryDark font-semibold text-md`}
              >
                {registrationSection > 0 && (
                  <div
                    style={{ gridArea: '1 / 1 / 2 / 2' }}
                    // className="lg:fixed 2xl:bottom-8 2xl:left-8 bottom-6 left-6 inline cursor-pointer select-none"
                    onClick={() => {
                      setRegistrationSection(registrationSection - 1);
                    }}
                  >
                    <div
                      style={{ width: 'fit-content' }}
                      className="hidden md:inline-flex cursor-pointer select-none bg-[#2D5016] text-white rounded-[30px] py-3 pl-2 pr-4 text-xs md:text-lg border-2 border-[#2D5016]"
                    >
                      <ChevronLeftIcon className="text-white" />
                      prev page
                    </div>
                    <div
                      style={{ width: 'fit-content' }}
                      className="md:hidden cursor-pointer select-none bg-[#2D5016] text-white rounded-[30px] py-3 pl-2 pr-4 text-xs md:text-lg border-2 border-[#2D5016]"
                    >
                      <ChevronLeftIcon className="text-white" />
                      prev
                    </div>
                  </div>
                )}

                <div
                  className="flex justify-center items-center"
                  style={{ gridArea: '1 / 2 / 2 / 3' }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      onClick={async (e) => {
                        e.preventDefault();
                        if (isSavingApplication) return;

                        // Only allow jumping to pages if current page is complete or if going backwards
                        if (i > registrationSection && !validateCurrentPage(values)) {
                          alert(
                            'Please fill out all required fields on the current page before proceeding.',
                          );
                          return;
                        }

                        if (dirty || resumeFileUpdated) {
                          setIsSavingApplication(true);
                          await handleSaveProfile(values, registrationSection, resetForm);
                          setIsSavingApplication(false);
                        }
                        setRegistrationSection(i);
                      }}
                      style={{ backgroundColor: registrationSection == i ? '#4C4950' : '#9F9EA7' }}
                      className="rounded-full w-3 h-3 mr-2 cursor-pointer"
                    />
                  ))}
                </div>

                {registrationSection < 7 && (
                  <div
                    className="flex justify-end "
                    style={{ gridArea: '1 / 3 / 2 / 4' }}
                    onClick={async (e) => {
                      e.preventDefault();
                      if (isSavingApplication) {
                        return;
                      }

                      // Validate current page before proceeding
                      if (!validateCurrentPage(values)) {
                        alert(
                          'Please fill out all required fields before proceeding to the next page.',
                        );
                        return;
                      }

                      if (dirty || resumeFileUpdated) {
                        setIsSavingApplication(true);
                        await handleSaveProfile(values, registrationSection, resetForm);
                        setIsSavingApplication(false);
                      }
                      setRegistrationSection(registrationSection + 1);
                    }}
                  >
                    <div
                      style={{ width: 'fit-content' }}
                      className="hidden md:inline-flex cursor-pointer select-none bg-[#2D5016] text-white text-xs md:text-lg rounded-[30px] py-3 pr-2 pl-4 border-2 border-[#2D5016]"
                    >
                      next page
                      <ChevronRightIcon />
                    </div>
                    <div
                      style={{ width: 'fit-content' }}
                      className="md:hidden cursor-pointer select-none bg-[#2D5016] text-white text-xs md:text-lg rounded-[30px] py-3 pr-2 pl-4 border-2 border-[#2D5016]"
                    >
                      next
                      <ChevronRightIcon />
                    </div>
                  </div>
                )}
              </section>
              <Snackbar
                open={displayProfileSavedToaster}
                autoHideDuration={5000}
                onClose={() => setDisplayProfileSavedToaster(false)}
                message="Profile saved"
              />
            </section>
            <ApplicationAutosaveHandler
              currentPage={registrationSection}
              defaultResumeUrl={partialProfile?.resume || ''}
              resumeFile={resumeFileUpdated ? resumeFile : null}
              updatePartialProfile={updatePartialProfile}
            />
          </>
        )}
      </Formik>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  const { data } = await RequestHelper.get<{ allowRegistrations: boolean }>(
    `${protocol}://${context.req.headers.host}/api/registrations/status`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return {
    props: {
      allowedRegistrations: data.allowRegistrations,
    },
  };
};
