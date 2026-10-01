export function LogoIcon({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 14.1667V5.83333M7.5 14.1667C7.5 14.6087 7.3244 15.0326 7.01184 15.3452C6.69928 15.6577 6.27536 15.8333 5.83333 15.8333H4.16667C3.72464 15.8333 3.30072 15.6577 2.98816 15.3452C2.67559 15.0326 2.5 14.6087 2.5 14.1667V5.83333C2.5 5.39131 2.67559 4.96738 2.98816 4.65482C3.30072 4.34226 3.72464 4.16667 4.16667 4.16667H5.83333C6.27536 4.16667 6.69928 4.34226 7.01184 4.65482C7.3244 4.96738 7.5 5.39131 7.5 5.83333M7.5 14.1667C7.5 14.6087 7.67559 15.0326 7.98816 15.3452C8.30072 15.6577 8.72464 15.8333 9.16667 15.8333H10.8333C11.2754 15.8333 11.6993 15.6577 12.0118 15.3452C12.3244 15.0326 12.5 14.6087 12.5 14.1667M7.5 5.83333C7.5 5.39131 7.67559 4.96738 7.98816 4.65482C8.30072 4.34226 8.72464 4.16667 9.16667 4.16667H10.8333C11.2754 4.16667 11.6993 4.34226 12.0118 4.65482C12.3244 4.96738 12.5 5.39131 12.5 5.83333M12.5 14.1667V5.83333M12.5 14.1667C12.5 14.6087 12.6756 15.0326 12.9882 15.3452C13.3007 15.6577 13.7246 15.8333 14.1667 15.8333H15.8333C16.2754 15.8333 16.6993 15.6577 17.0118 15.3452C17.3244 15.0326 17.5 14.6087 17.5 14.1667V5.83333C17.5 5.39131 17.3244 4.96738 17.0118 4.65482C16.6993 4.34226 16.2754 4.16667 15.8333 4.16667H14.1667C13.7246 4.16667 13.3007 4.34226 12.9882 4.65482C12.6756 4.96738 12.5 5.39131 12.5 5.83333"
        stroke="white"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ size = 16, color = '#666677' }: { size?: number; color?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.33333 8H12.6667" stroke={color} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3.33333V12.6667" stroke={color} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UploadIcon({ size = 24, color = '#666677' }: { size?: number; color?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 8L12 3L7 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ size = 12, color = '#666677' }: { size?: number; color?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 11.6667 11.6667" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.8333 0.833333L0.833333 10.8333" stroke={color} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0.833333 0.833333L10.8333 10.8333" stroke={color} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
