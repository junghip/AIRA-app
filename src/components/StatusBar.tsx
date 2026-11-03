import signalWifiBattery from '../assets/common/signal-wifi-battery.svg'
import './StatusBar.css'

export default function StatusBar() {
  return (
    <div className="status-bar">
      <div className="status-bar__side status-bar__side--left">
        <span className="status-bar__time">9:41</span>
      </div>
      <div className="status-bar__island" />
      <div className="status-bar__side status-bar__side--right">
        <img src={signalWifiBattery} width={78.4} height={13} alt="" />
      </div>
    </div>
  )
}
