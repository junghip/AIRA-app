import barcode from '../../assets/pass/ticket-barcode.svg'
import ticketFill from '../../assets/pass/ticket-clip-group.svg'
import divider from '../../assets/pass/ticket-divider.svg'
import perforation from '../../assets/pass/ticket-perforation.svg'
import plane from '../../assets/pass/ticket-plane.svg'
import routeArrow from '../../assets/pass/ticket-route-arrow.svg'
import routeLine from '../../assets/pass/ticket-route-line.svg'
import ticketShape from '../../assets/pass/ticket-shape.svg'
import './BoardingPass.css'

// 피그마 "boarding-pass-mobile" — 기준 크기 216×349 (READING 화면), 다른 화면에선 scale로 키우고 줄임
export const PASS_W = 216.342
export const PASS_H = 348.551

export default function BoardingPass() {
  return (
    <div className="bp" role="img" aria-label="Boarding pass KE 081, ICN to LAX, 03 NOV, gate 28, boarding 13:50, seat 28A">
      <img className="bp__fill" src={ticketShape} alt="" />
      <img className="bp__fill" src={ticketFill} alt="" />

      <p className="bp__t bp__label">BOARDING PASS</p>
      <div className="bp__v bp__plane"><img src={plane} alt="" /></div>

      <p className="bp__t bp__city">ICN</p>
      <p className="bp__t bp__city bp__city--to">LAX</p>
      <div className="bp__v bp__route-line"><img src={routeLine} alt="" /></div>
      <div className="bp__v bp__route-arrow"><img src={routeArrow} alt="" /></div>
      <p className="bp__t bp__city-name">Seoul Incheon</p>
      <p className="bp__t bp__city-name bp__city-name--to">Los Angeles</p>

      <img className="bp__divider" src={divider} alt="" />

      <p className="bp__t bp__key bp__key--flight">FLIGHT</p>
      <p className="bp__t bp__val bp__val--flight">KE 081</p>
      <p className="bp__t bp__key bp__key--date">DATE</p>
      <p className="bp__t bp__val bp__val--date">03 NOV</p>

      <p className="bp__t bp__key bp__key--gate">GATE</p>
      <p className="bp__t bp__big bp__big--gate">28</p>
      <p className="bp__t bp__key bp__key--boarding">BOARDING</p>
      <p className="bp__t bp__big bp__big--boarding">13:50</p>
      <p className="bp__t bp__key bp__key--seat">SEAT</p>
      <p className="bp__t bp__big bp__big--seat">28A</p>

      <div className="bp__v bp__perforation"><img src={perforation} alt="" /></div>

      <p className="bp__t bp__passenger-key">PASSENGER</p>
      <p className="bp__t bp__passenger">HAHA</p>
      <p className="bp__t bp__class">Economy</p>

      <div className="bp__v bp__barcode"><img src={barcode} alt="" /></div>
      <p className="bp__t bp__code">KE081 · ICNLAX · 28A</p>
    </div>
  )
}
