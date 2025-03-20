
interface props {
  children: React.ReactNode,
  onClick: () => void
  wait?: boolean

}

export default function Button({ children, onClick, wait }: props) {
  return (
    <button  disabled={wait} onClick={wait ? undefined : onClick} className={` ${wait ? 'bg-neutral-300 cursor-not-allowed text-black/60  ' : ' bg-[#fdfe1f] cursor-pointer text-black '} px-12 border-b-4 border-l-4  border-black hover:border-b-0 hover:border-l-0 transition-all duration-100  py-2 text-2xl justify-center rounded-lg  items-center shadow-sm hover:shadow-outline shadow-black/50 `}>{children}</button>
  )
}

