import { Disclosure } from '@headlessui/react';
import { PlusIcon, MinusIcon } from '@heroicons/react/solid';
import Markdown from 'react-markdown';

/**
 *
 * Represents props used by FaqDisclosure component
 *
 * @param question a frequently asked question
 * @param answer answer to corresponding question
 * @param isOpen boolean variable used to determine whether the disclosure should be open or not
 * @param toggleDisclosure function to call when user wants to open/close disclosure
 *
 */
interface Props {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleDisclosure: () => void;
}

/**
 *
 * Component representing a FAQ question in /about/faq
 *
 */
export default function FaqDisclosure({ question, answer, isOpen, toggleDisclosure }: Props) {
  return (
    <Disclosure>
      <div
        style={{
          boxShadow: '0 5px 16px 0 rgb(8,52,15,0.06)',
        }}
        className="bg-[#231140] rounded-md p-4 border border-white"
      >
        {/* Button to toggle the FAQ */}
        <Disclosure.Button as="div">
          <button
            className="w-full flex justify-between items-center p-2 text-[#6F6C90] font-medium"
            onClick={toggleDisclosure}
          >
            <h1
              style={{ fontFamily: 'youngSerif', color: '#FFFFFF' }}
              className="text-left text-lg"
            >
              {question}
            </h1>

            {/* Plus/Minus icon */}
            <div
              style={{ backgroundColor: !isOpen ? '#5F5FFF' : '#4d4dddff' }}
              className="p-3 rounded-md"
            >
              {!isOpen ? (
                <PlusIcon className="w-5 h-5 text-[#FFFFFF]" />
              ) : (
                <MinusIcon className="w-5 h-5 text-[#FFFFFF]" />
              )}
            </div>
          </button>
        </Disclosure.Button>

        {/* FAQ content */}
        {isOpen && (
          <div>
            <Disclosure.Panel
              style={{ color: '#dfdcdcff', fontFamily: 'DM-Sans' }}
              className="my-2 py-2 px-2 text-left text-sm"
              static
            >
              <Markdown
                components={{
                  a(props) {
                    const { node, ...rest } = props;
                    return <a className="underline underline-offset-8" {...rest} />;
                  },
                }}
              >
                {answer}
              </Markdown>
            </Disclosure.Panel>
          </div>
        )}
      </div>
    </Disclosure>
  );
}
