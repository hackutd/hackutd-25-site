export interface Props {
  /**
   * Raw JSON of the scan.
   */
  data: object;
  /**
   * Name of the scan.
   */
  name: string;
  /**
   * Click callback.
   */
  onClick: () => void;
}
export default function ScanType({ name, onClick }: Props) {
  return (
    <div
      className="p-3 md:p-4 cursor-pointer m-2 md:m-3 bg-primaryDark rounded-lg text-white hover:bg-white hover:text-[#40B7BA] transition duration-300 ease-in-out h-min min-h-[3rem] flex items-center justify-center"
      onClick={onClick}
    >
      <div className="text-center text-base md:text-lg font-bold">{name}</div>
    </div>
  );
}
