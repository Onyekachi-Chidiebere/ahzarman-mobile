import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { PaymentPinModal, ScreenHeader } from '../components';
import { C } from '../constants';
import {
  AIRPORTS,
  FLIGHT_CITIES,
  SAMPLE_FLIGHTS,
  airportName,
  type FlightResult,
} from '../flightData';
import type { AppScreen, Tx } from '../types';

const grey = C.muted;

const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
const fmtNGN = (n: number) => `₦${n.toLocaleString()}.00`;

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

type PaxFields = {
  title: string;
  gender: string;
  surname: string;
  firstName: string;
  middleName: string;
  dob: string;
  email: string;
  phone: string;
};

function validatePax(f: PaxFields): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!f.title) errs.title = 'Required';
  if (!f.gender) errs.gender = 'Required';
  if (!f.surname || f.surname.trim().length < 2) errs.surname = f.surname ? 'Min 2 characters' : 'Required';
  if (!f.firstName || f.firstName.trim().length < 2) errs.firstName = f.firstName ? 'Min 2 characters' : 'Required';
  if (!f.dob) {
    errs.dob = 'Required';
  } else {
    const dobMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(f.dob);
    if (!dobMatch) {
      errs.dob = 'Use dd-mm-yyyy format';
    } else {
      const dd = Number(dobMatch[1]);
      const mm = Number(dobMatch[2]);
      const yyyy = Number(dobMatch[3]);
      const parsed = new Date(yyyy, mm - 1, dd);
      if (
        parsed.getDate() !== dd ||
        parsed.getMonth() !== mm - 1 ||
        parsed.getFullYear() !== yyyy ||
        yyyy < 1900 ||
        yyyy > new Date().getFullYear() - 2
      ) {
        errs.dob = 'Enter a valid date of birth';
      }
    }
  }
  if (!f.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = f.email ? 'Invalid email address' : 'Required';
  if (!f.phone || !/^\+?[\d\s-]{7,15}$/.test(f.phone)) errs.phone = f.phone ? 'Invalid phone number' : 'Required';
  return errs;
}

function airportLine(code: string) {
  const city = FLIGHT_CITIES[code] ?? code;
  return `${city} - ${airportName(code)}`;
}

function CalendarPicker({
  selected,
  minDate,
  onSelect,
  onClose,
}: {
  selected: Date | null;
  minDate: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const base = selected && selected >= minDate ? selected : minDate;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isDisabled = (day: number) => {
    const cand = new Date(year, month, day);
    cand.setHours(0, 0, 0, 0);
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    return cand < min;
  };

  const monthLabel = cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={calStyles.overlay} onPress={onClose}>
        <Pressable style={calStyles.box} onPress={e => e.stopPropagation()}>
          <View style={calStyles.calHead}>
            <Pressable
              onPress={() => setCursor(new Date(year, month - 1, 1))}
              hitSlop={8}
            >
              <Text style={calStyles.nav}>‹</Text>
            </Pressable>
            <Text style={calStyles.month}>{monthLabel}</Text>
            <Pressable onPress={() => setCursor(new Date(year, month + 1, 1))} hitSlop={8}>
              <Text style={calStyles.nav}>›</Text>
            </Pressable>
          </View>
          <View style={calStyles.dowRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={i} style={calStyles.dow}>
                {d}
              </Text>
            ))}
          </View>
          <View style={calStyles.grid}>
            {cells.map((day, i) =>
              day == null ? (
                <View key={`e-${i}`} style={calStyles.cell} />
              ) : (
                <Pressable
                  key={day}
                  disabled={isDisabled(day)}
                  onPress={() => {
                    const d = new Date(year, month, day);
                    onSelect(d);
                    onClose();
                  }}
                  style={[
                    calStyles.cell,
                    isDisabled(day) && calStyles.cellDis,
                    selected &&
                      selected.getDate() === day &&
                      selected.getMonth() === month &&
                      selected.getFullYear() === year &&
                      calStyles.cellSel,
                  ]}
                >
                  <Text
                    style={[
                      calStyles.cellTxt,
                      isDisabled(day) && { color: C.placeholder },
                      selected &&
                        selected.getDate() === day &&
                        selected.getMonth() === month &&
                        selected.getFullYear() === year &&
                        calStyles.cellTxtSel,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
          <Pressable onPress={onClose} style={calStyles.closeBtn}>
            <Text style={calStyles.closeTxt}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AirportSearchSheet({
  onSelect,
  onClose,
  favourites,
  onToggleFav,
}: {
  onSelect: (code: string) => void;
  onClose: () => void;
  favourites: string[];
  onToggleFav: (code: string) => void;
}) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return AIRPORTS;
    return AIRPORTS.filter(
      a =>
        a.city.toLowerCase().includes(t) ||
        a.code.toLowerCase().includes(t) ||
        a.name.toLowerCase().includes(t),
    );
  }, [q]);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={sheetStyles.wrap}>
        <Pressable style={sheetStyles.backdrop} onPress={onClose} />
        <View style={sheetStyles.sheet}>
          <View style={sheetStyles.searchRow}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Circle cx={11} cy={11} r={8} stroke={grey} strokeWidth={1.8} />
              <Path d="M21 21l-4.35-4.35" stroke={grey} strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
            <TextInput
              style={sheetStyles.searchIn}
              placeholder="Enter city, airport, or place"
              placeholderTextColor={C.placeholder}
              value={q}
              onChangeText={setQ}
            />
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={sheetStyles.closeX}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: '72%' }} keyboardShouldPersistTaps="handled">
            {filtered.map((a, i) => (
              <Pressable
                key={a.code}
                onPress={() => onSelect(a.code)}
                style={[sheetStyles.row, i < filtered.length - 1 && sheetStyles.rowBorder]}
              >
                <View style={sheetStyles.ico}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z"
                      stroke={C.olive}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={sheetStyles.city}>{a.city}</Text>
                  <Text style={sheetStyles.name} numberOfLines={1}>
                    {a.name}
                  </Text>
                </View>
                <View style={sheetStyles.codeCol}>
                  <Text style={sheetStyles.code}>{a.code}</Text>
                  <Pressable onPress={() => onToggleFav(a.code)} hitSlop={8}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.9 1.18 6.88L12 17.77l-6.18 3.28L7 14.17 2 9.27l6.91-1.01L12 2z"
                        stroke={C.olive}
                        strokeWidth={1.6}
                        fill={favourites.includes(a.code) ? C.primary : 'none'}
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function FlightsScreen({
  goTo,
  onAddTx,
  onPurchaseComplete,
}: {
  goTo: (s: AppScreen) => void;
  onAddTx: (tx: Tx) => void;
  onPurchaseComplete: (pts: number) => void;
}) {
  const [from, setFrom] = useState('ABV');
  const [to, setTo] = useState('PHC');
  const [dep, setDep] = useState<Date | null>(null);
  const [ret, setRet] = useState<Date | null>(null);
  const [openCal, setOpenCal] = useState<'dep' | 'ret' | null>(null);
  const [tripType, setTripType] = useState<'one-way' | 'return' | 'multi'>('one-way');
  const [cabinClass, setCabinClass] = useState('Business');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [airportTarget, setAirportTarget] = useState<'from' | 'to' | null>(null);
  const [favourites, setFavourites] = useState<string[]>(['PHC', 'LOS']);
  const [showPax, setShowPax] = useState(false);
  const [currentPax, setCurrentPax] = useState(1);
  const [paxData, setPaxData] = useState<PaxFields[]>([]);
  const [selFlight, setSelFlight] = useState<FlightResult | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showPayPin, setShowPayPin] = useState(false);

  const totalPax = adults + children + infants;
  const canSearch = !!dep && (tripType === 'one-way' || !!ret);
  const flightPts = selFlight?.pts ?? 0;

  const baseFare = selFlight?.price ?? 0;
  const taxes = Math.round(baseFare * 0.075);
  const surcharge = Math.round(baseFare * 0.02);
  const totalPay = baseFare + taxes + surcharge;

  const getPaxType = (idx: number) => {
    if (idx <= adults) return 'Adult';
    if (idx <= adults + children) return 'Child';
    return 'Infant';
  };

  const toggleFav = (code: string) => {
    setFavourites(f => (f.includes(code) ? f.filter(c => c !== code) : [...f, code]));
  };

  const handleBookSuccess = () => {
    if (!selFlight) return;
    onAddTx({
      id: String(Date.now()),
      type: 'flights',
      title: `${from} → ${to}`,
      amount: `-₦${totalPay.toLocaleString()}`,
      pts: `+${flightPts} pts`,
      date: 'Just now',
      status: 'Successful',
    });
    setShowPayPin(false);
    onPurchaseComplete(flightPts);
  };

  if (showSummary && selFlight) {
    return (
      <BookingSummary
        flight={selFlight}
        from={from}
        to={to}
        dep={dep}
        ret={ret}
        tripType={tripType}
        cabinClass={cabinClass}
        paxData={paxData}
        adults={adults}
        children={children}
        infants={infants}
        totalPay={totalPay}
        taxes={taxes}
        surcharge={surcharge}
        baseFare={baseFare}
        onBack={() => setShowSummary(false)}
        onProceedPay={() => setShowPayPin(true)}
        showPayPin={showPayPin}
        onDismissPin={() => setShowPayPin(false)}
        onConfirmPay={handleBookSuccess}
      />
    );
  }

  if (showPax && selFlight) {
    return (
      <PassengerDetails
        key={currentPax}
        paxIndex={currentPax}
        totalPax={totalPax}
        paxType={getPaxType(currentPax)}
        flightInfo={{
          from,
          to,
          airline: selFlight.airline,
          dep: selFlight.dep,
          arr: selFlight.arr,
          price: selFlight.price,
          pts: selFlight.pts,
        }}
        onBack={() => {
          if (currentPax > 1) {
            setCurrentPax(p => p - 1);
            setPaxData(d => d.slice(0, -1));
          } else {
            setShowPax(false);
          }
        }}
        onContinue={data => {
          const next = [...paxData, data];
          setPaxData(next);
          if (currentPax < totalPax) setCurrentPax(p => p + 1);
          else {
            setShowPax(false);
            setShowSummary(true);
          }
        }}
      />
    );
  }

  if (showResults) {
    return (
      <FlightResults
        from={from}
        to={to}
        dep={dep}
        adults={adults}
        children={children}
        infants={infants}
        cabinClass={cabinClass}
        onBack={() => setShowResults(false)}
        onSelectFlight={f => {
          setSelFlight(f);
          setCurrentPax(1);
          setPaxData([]);
          setShowResults(false);
          setShowPax(true);
        }}
      />
    );
  }

  return (
    <View style={styles.page}>
      <ScreenHeader
        title="Flight Tickets"
        onBack={() => goTo('services')}
        rightSlot={
          <Pressable hitSlop={8}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M3 12h18M3 6h18M3 18h18" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </Pressable>
        }
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.tabs}>
          {(
            [
              { k: 'one-way' as const, l: 'One Way' },
              { k: 'return' as const, l: 'Round Trip' },
              { k: 'multi' as const, l: 'Multi-City', dis: true },
            ] as const
          ).map(t => (
            <Pressable
              key={t.k}
              disabled={'dis' in t && t.dis}
              onPress={() => {
                setTripType(t.k);
                if (t.k === 'one-way') setRet(null);
              }}
              style={[
                styles.tab,
                tripType === t.k && styles.tabOn,
                'dis' in t && t.dis && styles.tabDis,
              ]}
            >
              <Text style={[styles.tabTxt, tripType === t.k && styles.tabTxtOn, 'dis' in t && t.dis && { color: C.disabledTxt }]}>
                {t.l}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.card, styles.routeCard]}>
          <Text style={styles.lbl}>From</Text>
          <Pressable onPress={() => setAirportTarget('from')} style={styles.airRow}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z"
                stroke={C.olive}
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={styles.airHint}>From</Text>
              <Text style={styles.airMain}>{airportLine(from)}</Text>
            </View>
            <Text style={styles.chev}>▼</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              const a = from;
              setFrom(to);
              setTo(a);
            }}
            style={styles.swap}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M7 16V4M7 4L3 8M7 4l4 4" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
              <Path d="M17 8v12M17 20l4-4M17 20l-4-4" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </Pressable>

          <Text style={styles.lbl}>To</Text>
          <Pressable onPress={() => setAirportTarget('to')} style={styles.airRow}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={4} stroke={C.olive} strokeWidth={1.6} />
              <Path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke={C.olive} strokeWidth={1.6} strokeLinecap="round" />
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={styles.airHint}>To</Text>
              <Text style={styles.airMain}>{airportLine(to)}</Text>
            </View>
            <Text style={styles.chev}>▼</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lbl}>Departure</Text>
              <Pressable
                onPress={() => setOpenCal(openCal === 'dep' ? null : 'dep')}
                style={[styles.dateCell, (openCal === 'dep' || dep) && styles.dateCellAct]}
              >
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                  <Rect x={3} y={4} width={18} height={18} rx={2} stroke={dep ? C.olive : grey} strokeWidth={1.8} />
                  <Path d="M8 2v4M16 2v4M3 10h18" stroke={dep ? C.olive : grey} strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
                <Text style={[styles.dateTxt, !dep && { color: C.placeholder }]}>{dep ? fmtDate(dep) : 'Select date'}</Text>
              </Pressable>
            </View>
            {tripType === 'return' ? (
              <View style={{ flex: 1 }}>
                <Text style={styles.lbl}>Return</Text>
                <Pressable
                  disabled={!dep}
                  onPress={() => dep && setOpenCal(openCal === 'ret' ? null : 'ret')}
                  style={[
                    styles.dateCell,
                    !dep && { backgroundColor: C.disabled, opacity: 0.9 },
                    (openCal === 'ret' || ret) && dep && styles.dateCellAct,
                  ]}
                >
                  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                    <Rect x={3} y={4} width={18} height={18} rx={2} stroke={ret ? C.olive : grey} strokeWidth={1.8} />
                    <Path d="M8 2v4M16 2v4M3 10h18" stroke={ret ? C.olive : grey} strokeWidth={1.8} strokeLinecap="round" />
                  </Svg>
                  <Text style={[styles.dateTxt, !ret && { color: C.placeholder }]}>{ret ? fmtDate(ret) : 'Select date'}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>

        {openCal === 'dep' ? (
          <CalendarPicker
            selected={dep}
            minDate={today()}
            onSelect={d => {
              setDep(d);
              if (ret && ret <= d) setRet(null);
              setOpenCal(null);
            }}
            onClose={() => setOpenCal(null)}
          />
        ) : null}
        {openCal === 'ret' && tripType === 'return' ? (
          <CalendarPicker
            selected={ret}
            minDate={dep ? addDays(dep, 1) : addDays(today(), 1)}
            onSelect={d => {
              setRet(d);
              setOpenCal(null);
            }}
            onClose={() => setOpenCal(null)}
          />
        ) : null}

        <View style={styles.card}>
          <Text style={styles.paxTitle}>Passengers</Text>
          {(
            [
              { label: 'Adults', sub: '12+ years', val: adults, set: setAdults, min: 1, max: 9 },
              { label: 'Children', sub: '2–11 years', val: children, set: setChildren, min: 0, max: 8 },
              { label: 'Infants', sub: 'Under 2', val: infants, set: setInfants, min: 0, max: 4 },
            ] as const
          ).map((p, i, arr) => (
            <View
              key={p.label}
              style={[styles.paxRow, i < arr.length - 1 && styles.paxRowBorder]}
            >
              <View>
                <Text style={styles.paxLbl}>{p.label}</Text>
                <Text style={styles.paxSub}>{p.sub}</Text>
              </View>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => p.set(Math.max(p.min, p.val - 1))}
                  style={[styles.stepBtn, p.val <= p.min && styles.stepBtnDis]}
                >
                  <Text style={[styles.stepTxt, p.val <= p.min && { color: C.disabledTxt }]}>−</Text>
                </Pressable>
                <Text style={styles.stepVal}>{p.val}</Text>
                <Pressable
                  onPress={() => p.set(Math.min(p.max, p.val + 1))}
                  style={[styles.stepBtn, p.val >= p.max && styles.stepBtnDis]}
                >
                  <Text style={[styles.stepTxt, p.val >= p.max && { color: C.disabledTxt }]}>+</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.paxTitle}>Cabin Class</Text>
          <View style={styles.cabinRow}>
            {['Economy', 'Business', 'First Class'].map(c => (
              <Pressable
                key={c}
                onPress={() => setCabinClass(c)}
                style={[styles.cabinChip, cabinClass === c && styles.cabinChipOn]}
              >
                <Text style={[styles.cabinTxt, cabinClass === c && styles.cabinTxtOn]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          disabled={!canSearch}
          onPress={() => canSearch && setShowResults(true)}
          style={[styles.searchBtn, !canSearch && styles.searchBtnDis]}
        >
          <Text style={styles.searchTxt}>
            {canSearch ? `Search Flights — ${fmtDate(dep)}` : 'Select departure date to search'}
          </Text>
        </Pressable>
      </ScrollView>

      {airportTarget ? (
        <AirportSearchSheet
          onSelect={code => {
            if (airportTarget === 'from') setFrom(code);
            else setTo(code);
            setAirportTarget(null);
          }}
          onClose={() => setAirportTarget(null)}
          favourites={favourites}
          onToggleFav={toggleFav}
        />
      ) : null}
    </View>
  );
}

function FlightResults({
  from,
  to,
  dep,
  adults,
  children,
  infants,
  cabinClass,
  onBack,
  onSelectFlight,
}: {
  from: string;
  to: string;
  dep: Date | null;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  onBack: () => void;
  onSelectFlight: (f: FlightResult) => void;
}) {
  const [expandedAirline, setExpandedAirline] = useState<string | null>(null);
  const [selFlight, setSelFlight] = useState<FlightResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const airlines = [...new Set(SAMPLE_FLIGHTS.map(f => f.airline))];
  const grouped = airlines.map(a => ({
    airline: a,
    flights: SAMPLE_FLIGHTS.filter(f => f.airline === a),
  }));
  const totalPax = adults + children + infants;
  const paxLabel = `${totalPax} Passenger${totalPax > 1 ? 's' : ''}`;
  const filters = ['Filter', 'Prices', 'Airlines', 'Times', 'Sort'];

  return (
    <View style={styles.page}>
      <View style={styles.resHead}>
        <Pressable onPress={onBack} style={styles.resBack}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </Pressable>
        <Text style={styles.resTitle}>Search Result</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.routePill}>
        <View style={styles.routeInner}>
          <View style={styles.routeL}>
            <Text style={styles.routeCode}>{from}</Text>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z"
                fill={C.primary}
              />
            </Svg>
            <Text style={styles.routeCode}>{to}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.routeDate}>{dep ? fmtDate(dep) : '—'}</Text>
            <Text style={styles.routeMeta}>
              {paxLabel} · {cabinClass}
            </Text>
          </View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        {filters.map(f => (
          <Pressable
            key={f}
            onPress={() => setActiveFilter(activeFilter === f ? null : f)}
            style={[styles.filterChip, activeFilter === f && styles.filterChipOn]}
          >
            <Text style={[styles.filterTxt, activeFilter === f && styles.filterTxtOn]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.resScroll} contentContainerStyle={styles.resContent}>
        <Text style={styles.resCount}>{SAMPLE_FLIGHTS.length} Result(s)</Text>
        {grouped.map(({ airline, flights }) => {
          const main = flights[0];
          const extra = flights.slice(1);
          const isExpanded = expandedAirline === airline;
          const isSelected = selFlight?.airline === airline && selFlight?.dep === main.dep;
          return (
            <View key={airline} style={{ marginBottom: 12 }}>
              <Pressable
                onPress={() => setSelFlight(isSelected ? null : main)}
                style={[styles.fCard, isSelected && styles.fCardSel]}
              >
                <View style={styles.fAirRow}>
                  <View style={styles.fAirL}>
                    <View style={styles.fAirIco}>
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z"
                          stroke="#4A6CF7"
                          strokeWidth={1.4}
                        />
                      </Svg>
                    </View>
                    <Text style={styles.fAirName}>{airline}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {main.cheapest ? (
                      <View style={styles.badgeG}>
                        <Text style={styles.badgeGtxt}>Cheapest</Text>
                      </View>
                    ) : null}
                    {main.quickest ? (
                      <View style={styles.badgeB}>
                        <Text style={styles.badgeBtxt}>Quickest</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={styles.fTimeRow}>
                  <View>
                    <Text style={styles.fTimeBig}>{main.dep}</Text>
                    <Text style={styles.fTimeSm}>
                      {FLIGHT_CITIES[from] || from} ({from})
                    </Text>
                  </View>
                  <View style={styles.fMid}>
                    <Text style={styles.fDur}>{main.dur}</Text>
                    <View style={styles.fDashRow}>
                      <View style={styles.fDash} />
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path d="M5 12h14M13 6l6 6-6 6" stroke={C.ink} strokeWidth={2} />
                      </Svg>
                    </View>
                    <Text style={styles.fStops}>{main.stops}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.fTimeBig}>{main.arr}</Text>
                    <Text style={styles.fTimeSm}>
                      {FLIGHT_CITIES[to] || to} ({to})
                    </Text>
                  </View>
                </View>
                <View style={styles.fPriceRow}>
                  <Text style={styles.fPriceLbl}>Price</Text>
                  <Text style={styles.fPrice}>₦{main.price.toLocaleString()}.00</Text>
                </View>
              </Pressable>
              {extra.length > 0 ? (
                <>
                  {isExpanded
                    ? extra.map((f, i) => {
                        const selExtra = selFlight?.dep === f.dep && selFlight?.airline === airline;
                        return (
                          <Pressable
                            key={i}
                            onPress={() => setSelFlight(selExtra ? null : f)}
                            style={[styles.fCard, { marginTop: 8 }, selExtra && styles.fCardSel]}
                          >
                            <View style={styles.fTimeRow}>
                              <View>
                                <Text style={styles.fTimeMed}>{f.dep}</Text>
                                <Text style={styles.fTimeSm}>
                                  {FLIGHT_CITIES[from]} ({from})
                                </Text>
                              </View>
                              <View style={styles.fMid}>
                                <Text style={styles.fDur}>{f.dur}</Text>
                                <View style={styles.fDashRow}>
                                  <View style={styles.fDash} />
                                </View>
                                <Text style={styles.fStops}>{f.stops}</Text>
                              </View>
                              <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.fTimeMed}>{f.arr}</Text>
                                <Text style={styles.fTimeSm}>
                                  {FLIGHT_CITIES[to]} ({to})
                                </Text>
                              </View>
                            </View>
                            <View style={styles.fPriceRow}>
                              <Text style={styles.fPriceLbl}>Price</Text>
                              <Text style={styles.fPrice}>₦{f.price.toLocaleString()}.00</Text>
                            </View>
                          </Pressable>
                        );
                      })
                    : null}
                  <Pressable
                    onPress={() => setExpandedAirline(isExpanded ? null : airline)}
                    style={styles.expandBtn}
                  >
                    <Text style={styles.expandTxt}>
                      {isExpanded ? 'Hide extra flights' : `+${extra.length} ${airline} Flight${extra.length > 1 ? 's' : ''}`}{' '}
                      {isExpanded ? '↑' : '»'}
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      {selFlight ? (
        <View style={styles.stickyBook}>
          <Pressable onPress={() => onSelectFlight(selFlight)} style={styles.bookBtn}>
            <Text style={styles.bookTxt}>Enter Passenger Details →</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function PassengerDetails({
  paxIndex,
  totalPax,
  paxType,
  flightInfo,
  onBack,
  onContinue,
}: {
  paxIndex: number;
  totalPax: number;
  paxType: string;
  flightInfo: {
    from: string;
    to: string;
    airline?: string;
    dep?: string;
    arr?: string;
    price?: number;
    pts?: number;
  };
  onBack: () => void;
  onContinue: (data: PaxFields) => void;
}) {
  const [fields, setFields] = useState<PaxFields>({
    title: '',
    gender: '',
    surname: '',
    firstName: '',
    middleName: '',
    dob: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set =
    (k: keyof PaxFields) =>
    (v: string) => {
      setFields(f => ({ ...f, [k]: v }));
      if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
    };

  const filled = ['title', 'gender', 'surname', 'firstName', 'dob', 'email', 'phone'].filter(
    k => fields[k as keyof PaxFields].trim(),
  ).length;
  const progress = Math.round((filled / 7) * 100);

  const handleContinue = () => {
    setSubmitted(true);
    const errs = validatePax(fields);
    if (!agreed) errs._terms = 'Please agree to continue';
    setErrors(errs);
    if (Object.keys(errs).length === 0) onContinue(fields);
  };

  const titles = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];
  const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

  return (
    <View style={styles.page}>
      <ScreenHeader
        title="Passenger Details"
        onBack={onBack}
        rightSlot={
          <View style={styles.paxBadge}>
            <Text style={styles.paxBadgeTxt}>
              {paxIndex}/{totalPax}
            </Text>
          </View>
        }
      />
      <View style={styles.progBg}>
        <View style={[styles.progFill, { width: `${progress}%` }]} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.paxScroll}>
        <View style={styles.pillCard}>
          <View style={styles.pillL}>
            <View style={styles.pillIco}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z"
                  stroke={C.olive}
                  strokeWidth={1.6}
                />
              </Svg>
            </View>
            <View>
              <Text style={styles.pillRoute}>
                {flightInfo.from} → {flightInfo.to}
              </Text>
              <Text style={styles.pillSub}>
                {flightInfo.airline} · {flightInfo.dep}–{flightInfo.arr}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.pillPrice}>₦{flightInfo.price?.toLocaleString()}</Text>
            <View style={styles.ptsMini}>
              <Text style={styles.ptsMiniTxt}>+{flightInfo.pts} pts</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.paxHead}>
            <View style={styles.paxHeadL}>
              <View style={styles.paxNum}>
                <Text style={styles.paxNumTxt}>{paxIndex}</Text>
              </View>
              <View>
                <Text style={styles.paxHeadTitle}>Passenger {paxIndex}</Text>
                <Text style={styles.paxHeadSub}>Enter details as on travel document</Text>
              </View>
            </View>
            <View style={styles.typePill}>
              <Text style={styles.typePillTxt}>{paxType}</Text>
            </View>
          </View>
          <View style={styles.sep} />

          <Text style={styles.lbl}>Title</Text>
          <View style={styles.chipRow}>
            {titles.map(t => (
              <Pressable key={t} onPress={() => set('title')(t)} style={[styles.chip, fields.title === t && styles.chipOn]}>
                <Text style={[styles.chipTxt, fields.title === t && styles.chipTxtOn]}>{t}</Text>
              </Pressable>
            ))}
          </View>
          {submitted && errors.title ? <Text style={styles.err}>{errors.title}</Text> : null}

          <Text style={[styles.lbl, { marginTop: 12 }]}>Gender</Text>
          <View style={styles.chipRowWrap}>
            {genders.map(g => (
              <Pressable key={g} onPress={() => set('gender')(g)} style={[styles.chip, fields.gender === g && styles.chipOn]}>
                <Text style={[styles.chipTxt, fields.gender === g && styles.chipTxtOn]} numberOfLines={1}>
                  {g}
                </Text>
              </Pressable>
            ))}
          </View>
          {submitted && errors.gender ? <Text style={styles.err}>{errors.gender}</Text> : null}

          <Text style={styles.lbl}>Surname</Text>
          <TextInput
            style={[styles.inp, submitted && errors.surname && styles.inpErr]}
            placeholder="Enter surname"
            placeholderTextColor={C.placeholder}
            value={fields.surname}
            onChangeText={set('surname')}
          />
          {submitted && errors.surname ? <Text style={styles.err}>{errors.surname}</Text> : null}

          <Text style={styles.lbl}>First Name</Text>
          <TextInput
            style={[styles.inp, submitted && errors.firstName && styles.inpErr]}
            placeholder="e.g. James"
            placeholderTextColor={C.placeholder}
            value={fields.firstName}
            onChangeText={set('firstName')}
          />
          {submitted && errors.firstName ? <Text style={styles.err}>{errors.firstName}</Text> : null}

          <Text style={styles.lbl}>Middle Name (optional)</Text>
          <TextInput
            style={styles.inp}
            placeholder="e.g. John"
            placeholderTextColor={C.placeholder}
            value={fields.middleName}
            onChangeText={set('middleName')}
          />

          <Text style={styles.lbl}>Date of Birth</Text>
          <TextInput
            style={[styles.inp, submitted && errors.dob && styles.inpErr]}
            placeholder="dd-mm-yyyy"
            placeholderTextColor={C.placeholder}
            value={fields.dob}
            onChangeText={set('dob')}
          />
          <Text style={styles.microHint}>Format: dd-mm-yyyy</Text>
          {submitted && errors.dob ? <Text style={styles.err}>{errors.dob}</Text> : null}

          <Text style={styles.lbl}>Email Address</Text>
          <TextInput
            style={[styles.inp, submitted && errors.email && styles.inpErr]}
            placeholder="example@gmail.com"
            placeholderTextColor={C.placeholder}
            value={fields.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {submitted && errors.email ? <Text style={styles.err}>{errors.email}</Text> : null}

          <Text style={styles.lbl}>Phone Number</Text>
          <TextInput
            style={[styles.inp, submitted && errors.phone && styles.inpErr]}
            placeholder="+234 800 000 0000"
            placeholderTextColor={C.placeholder}
            value={fields.phone}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
          />
          {submitted && errors.phone ? <Text style={styles.err}>{errors.phone}</Text> : null}

          <Pressable onPress={() => setAgreed(a => !a)} style={styles.checkRow}>
            <View style={[styles.checkbox, agreed && styles.checkboxOn]}>{agreed ? <Text style={{ color: C.ink }}>✓</Text> : null}</View>
            <Text style={styles.checkTxt}>I confirm details match my travel document</Text>
          </Pressable>
          {submitted && errors._terms ? <Text style={styles.err}>{errors._terms}</Text> : null}

          <Pressable onPress={handleContinue} style={styles.contBtn}>
            <Text style={styles.contTxt}>Continue →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function BookingSummary({
  flight,
  from,
  to,
  dep,
  ret: _ret,
  tripType,
  cabinClass,
  paxData,
  adults,
  children,
  infants,
  totalPay,
  taxes,
  surcharge,
  baseFare,
  onBack,
  onProceedPay,
  showPayPin,
  onDismissPin,
  onConfirmPay,
}: {
  flight: FlightResult;
  from: string;
  to: string;
  dep: Date | null;
  ret: Date | null;
  tripType: string;
  cabinClass: string;
  paxData: PaxFields[];
  adults: number;
  children: number;
  infants: number;
  totalPay: number;
  taxes: number;
  surcharge: number;
  baseFare: number;
  onBack: () => void;
  onProceedPay: () => void;
  showPayPin: boolean;
  onDismissPin: () => void;
  onConfirmPay: () => void;
}) {
  const paxTypeOf = (i: number) => {
    if (i < adults) return 'Adult';
    if (i < adults + children) return 'Child';
    return 'Infant';
  };

  return (
    <View style={styles.page}>
      <ScreenHeader title="Booking Summary" onBack={onBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.sumScroll, { paddingBottom: 120 }]}>
        <View style={styles.sumFlight}>
          <View style={styles.sumTop}>
            <View style={styles.sumTopIco}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 5s-2-2-4-1L13.5 7.5 4 6 2.5 7.5 10 11l-3 3-2.5-.5-1 1 3 2 2 3 1-1-.5-2.5 3-3 3.5 7.5 1.5-1.5L14 9.5 18 6c1-.5 3-1 3-1z"
                  fill="#fff"
                />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sumAir}>{flight.airline}</Text>
              <Text style={styles.sumSub}>
                {cabinClass} · {tripType === 'return' ? 'Round Trip' : 'One Way'}
              </Text>
            </View>
            <View style={styles.sumDatePill}>
              <Text style={styles.sumDateTxt}>{dep ? fmtDate(dep) : '—'}</Text>
            </View>
          </View>
          <View style={styles.sumMid}>
            <View>
              <Text style={styles.sumTime}>{flight.dep}</Text>
              <Text style={styles.sumCode}>{from}</Text>
              <Text style={styles.sumCity}>{FLIGHT_CITIES[from] || from}</Text>
            </View>
            <View style={styles.sumCenter}>
              <Text style={styles.fDur}>{flight.dur}</Text>
              <View style={styles.fDashRow}>
                <View style={[styles.fDash, { borderColor: C.error }]} />
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12h14M13 6l6 6-6 6" stroke={C.error} strokeWidth={2.2} />
                </Svg>
              </View>
              <Text style={styles.fStops}>{flight.stops}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.sumTime}>{flight.arr}</Text>
              <Text style={styles.sumCode}>{to}</Text>
              <Text style={styles.sumCity}>{FLIGHT_CITIES[to] || to}</Text>
            </View>
          </View>
          <View style={styles.sumPaxRow}>
            {adults > 0 ? (
              <Text style={styles.sumPaxLbl}>
                {adults} Adult{adults > 1 ? 's' : ''}
              </Text>
            ) : null}
            {children > 0 ? (
              <Text style={styles.sumPaxLbl}>
                {children} Child{children > 1 ? 'ren' : ''}
              </Text>
            ) : null}
            {infants > 0 ? (
              <Text style={styles.sumPaxLbl}>
                {infants} Infant{infants > 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sumSec}>Passengers</Text>
          {paxData.map((p, i) => (
            <View key={i} style={[styles.sumPaxItem, i < paxData.length - 1 && styles.sumPaxBorder]}>
              <View style={styles.sumPaxNum}>
                <Text style={styles.sumPaxNumTxt}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sumPaxName}>
                  {p.title} {p.firstName} {p.middleName ? `${p.middleName} ` : ''}
                  {p.surname}
                </Text>
                <Text style={styles.sumPaxMeta}>
                  {paxTypeOf(i)} · {p.gender} · DOB: {p.dob}
                </Text>
              </View>
              <View style={styles.sumTypeTag}>
                <Text style={styles.sumTypeTagTxt}>{paxTypeOf(i)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sumSec}>Fare Breakdown</Text>
          <View style={styles.fareRow}>
            <Text style={styles.fareLbl}>Base Fare ({paxData.length} pax)</Text>
            <Text style={styles.fareVal}>{fmtNGN(baseFare)}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={[styles.fareLbl, { color: grey }]}>Airport Tax & Surcharges</Text>
            <Text style={[styles.fareVal, { color: grey, fontWeight: '500' }]}>{fmtNGN(taxes)}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={[styles.fareLbl, { color: grey }]}>Fuel Surcharge</Text>
            <Text style={[styles.fareVal, { color: grey, fontWeight: '500' }]}>{fmtNGN(surcharge)}</Text>
          </View>
          <View style={styles.fareSep} />
          <View style={styles.fareRow}>
            <Text style={styles.fareTotalLbl}>Total Amount</Text>
            <Text style={styles.fareTotal}>{fmtNGN(totalPay)}</Text>
          </View>
          <View style={styles.ptsNote}>
            <Text style={styles.ptsNoteTxt}>+{flight.pts} Ahzarman points on this booking</Text>
          </View>
        </View>

        <View style={styles.policy}>
          <Text style={styles.policyTxt}>
            <Text style={{ fontWeight: '700' }}>Cancellation Policy:</Text> Free cancellation within 24 hours of booking. A fee
            applies thereafter. Tickets are non-transferable.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.sumSticky}>
        <View style={styles.sumStickyRow}>
          <Text style={styles.sumStickyLbl}>Total to pay</Text>
          <Text style={styles.sumStickyAmt}>{fmtNGN(totalPay)}</Text>
        </View>
        <Pressable onPress={onProceedPay} style={styles.procBtn}>
          <Text style={styles.procTxt}>Proceed to Payment →</Text>
        </Pressable>
      </View>

      <PaymentPinModal
        visible={showPayPin}
        amountLabel={fmtNGN(totalPay)}
        onDismiss={onDismissPin}
        onConfirm={onConfirmPay}
      />
    </View>
  );
}

const calStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  box: { backgroundColor: C.white, borderRadius: 16, padding: 16 },
  calHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  nav: { fontSize: 22, color: C.ink, paddingHorizontal: 8 },
  month: { fontSize: 16, fontWeight: '600', color: C.ink },
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dow: { flex: 1, textAlign: 'center', fontSize: 11, color: grey },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellDis: { opacity: 0.35 },
  cellSel: { backgroundColor: C.primary, borderRadius: 20 },
  cellTxt: { fontSize: 14, color: C.ink, fontWeight: '500' },
  cellTxtSel: { color: C.ink, fontWeight: '700' },
  closeBtn: { marginTop: 12, alignItems: 'center', padding: 8 },
  closeTxt: { color: C.primary, fontWeight: '600' },
});

const sheetStyles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIn: { flex: 1, fontSize: 14, color: C.ink },
  closeX: { fontSize: 18, fontWeight: '600', color: C.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  ico: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.primFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  city: { fontSize: 14, fontWeight: '600', color: C.ink },
  name: { fontSize: 11, color: grey, marginTop: 1 },
  codeCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  code: { fontSize: 14, fontWeight: '700', color: C.ink },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F8F9F6' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 14 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
    gap: 2,
  },
  tab: { flex: 1, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: C.primary },
  tabDis: { backgroundColor: '#f0f0f0' },
  tabTxt: { fontSize: 12, color: grey },
  tabTxtOn: { fontWeight: '700', color: C.ink },
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  routeCard: { position: 'relative', minHeight: 200 },
  lbl: {
    fontSize: 11,
    fontWeight: '500',
    color: grey,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  airRow: {
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F8F9F6',
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  airHint: { fontSize: 11, color: grey },
  airMain: { fontSize: 15, fontWeight: '700', color: C.ink },
  chev: { color: grey, fontSize: 10 },
  swap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -18,
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primary,
    borderWidth: 3,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateCell: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: '#F8F9F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  dateCellAct: { borderColor: C.primary },
  dateTxt: { fontSize: 13, fontWeight: '500', color: C.ink },
  paxTitle: { fontSize: 14, fontWeight: '600', color: C.ink, marginBottom: 14 },
  paxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14 },
  paxRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 14 },
  paxLbl: { fontSize: 14, fontWeight: '600', color: C.ink },
  paxSub: { fontSize: 11, color: grey, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: C.primXlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDis: { backgroundColor: C.disabled },
  stepTxt: { fontSize: 20, fontWeight: '700', color: C.olive },
  stepVal: { fontSize: 18, fontWeight: '700', color: C.ink, minWidth: 22, textAlign: 'center' },
  cabinRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  cabinChip: {
    flex: 1,
    minWidth: '28%',
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cabinChipOn: { borderColor: C.primary, backgroundColor: C.primXlt },
  cabinTxt: { fontSize: 13, color: grey },
  cabinTxtOn: { fontWeight: '700', color: C.olive },
  searchBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnDis: { opacity: 0.45 },
  searchTxt: { fontSize: 15, fontWeight: '700', color: C.ink },
  resHead: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  resBack: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  resTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.ink },
  routePill: { paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.white },
  routeInner: {
    borderWidth: 1.5,
    borderColor: C.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: C.primFaint,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeL: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeCode: { fontSize: 15, fontWeight: '700', color: C.ink },
  routeDate: { fontSize: 11, fontWeight: '500', color: C.ink },
  routeMeta: { fontSize: 11, color: grey, marginTop: 2 },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 14, gap: 8, backgroundColor: C.white },
  filterChip: {
    height: 36,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginRight: 8,
  },
  filterChipOn: { borderColor: C.primary, backgroundColor: C.primXlt },
  filterTxt: { fontSize: 13, color: C.ink },
  filterTxtOn: { fontWeight: '600', color: C.olive },
  resScroll: { flex: 1 },
  resContent: { padding: 16, paddingBottom: 100 },
  resCount: { fontSize: 13, color: grey, marginBottom: 12 },
  fCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    overflow: 'hidden',
  },
  fCardSel: { borderColor: C.primary },
  fAirRow: {
    paddingHorizontal: 14,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fAirL: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fAirIco: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fAirName: { fontSize: 14, fontWeight: '600', color: C.ink },
  badgeG: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#EAFAF1',
    borderWidth: 1,
    borderColor: '#A9DFBF',
  },
  badgeGtxt: { fontSize: 10, fontWeight: '600', color: '#1E8449' },
  badgeB: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#D6EEF8',
    borderWidth: 1,
    borderColor: '#A9D0E8',
  },
  badgeBtxt: { fontSize: 10, fontWeight: '600', color: '#1A6A8A' },
  fTimeRow: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  fTimeBig: { fontSize: 20, fontWeight: '700', color: C.ink },
  fTimeMed: { fontSize: 18, fontWeight: '700', color: C.ink },
  fTimeSm: { fontSize: 11, color: grey, marginTop: 2 },
  fMid: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
  fDur: { fontSize: 11, color: grey, marginBottom: 5 },
  fDashRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  fDash: { flex: 1, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: C.borderMd },
  fStops: { fontSize: 11, color: grey, marginTop: 5 },
  fPriceRow: {
    backgroundColor: C.primFaint,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fPriceLbl: { fontSize: 13, color: grey },
  fPrice: { fontSize: 16, fontWeight: '700', color: C.olive },
  expandBtn: {
    marginTop: 8,
    backgroundColor: C.primary,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  expandTxt: { fontSize: 14, fontWeight: '600', color: C.ink },
  stickyBook: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  bookBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTxt: { fontSize: 15, fontWeight: '700', color: C.ink },
  paxBadge: {
    backgroundColor: C.primXlt,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  paxBadgeTxt: { fontSize: 12, fontWeight: '600', color: C.olive },
  progBg: { height: 3, backgroundColor: C.border },
  progFill: { height: '100%', backgroundColor: C.primary, borderRadius: 3 },
  paxScroll: { padding: 16, paddingBottom: 40 },
  pillCard: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pillL: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pillIco: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.primXlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRoute: { fontSize: 14, fontWeight: '700', color: C.ink },
  pillSub: { fontSize: 11, color: grey, marginTop: 2 },
  pillPrice: { fontSize: 15, fontWeight: '700', color: C.ink },
  ptsMini: { backgroundColor: C.primXlt, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, marginTop: 2 },
  ptsMiniTxt: { fontSize: 10, fontWeight: '600', color: C.olive },
  paxHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  paxHeadL: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paxNum: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paxNumTxt: { fontSize: 14, fontWeight: '700', color: C.ink },
  paxHeadTitle: { fontSize: 14, fontWeight: '700', color: C.ink },
  paxHeadSub: { fontSize: 11, color: grey },
  typePill: { backgroundColor: C.primXlt, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  typePillTxt: { fontSize: 11, fontWeight: '600', color: C.olive },
  sep: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: '#F8F9F6',
  },
  chipOn: { borderColor: C.primary, backgroundColor: C.primXlt },
  chipTxt: { fontSize: 13, color: grey },
  chipTxtOn: { fontWeight: '700', color: C.olive },
  inp: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: '#F8F9F6',
    paddingHorizontal: 12,
    fontSize: 14,
    color: C.ink,
    marginBottom: 4,
  },
  inpErr: { borderColor: C.errorBorder, backgroundColor: C.errorBg },
  err: { fontSize: 11, color: C.error, marginBottom: 8 },
  microHint: { fontSize: 11, color: C.placeholder, marginBottom: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, marginBottom: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: C.primary, borderColor: C.primary },
  checkTxt: { flex: 1, fontSize: 13, color: C.body },
  contBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  contTxt: { fontSize: 16, fontWeight: '700', color: C.ink },
  sumScroll: { paddingHorizontal: 16, paddingTop: 16 },
  sumFlight: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  sumTop: {
    backgroundColor: C.ink,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sumTopIco: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sumAir: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sumSub: { fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 2 },
  sumDatePill: { backgroundColor: 'rgba(255,255,255,.18)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  sumDateTxt: { fontSize: 11, color: 'rgba(255,255,255,.85)' },
  sumMid: { padding: 16, backgroundColor: C.white, flexDirection: 'row', alignItems: 'center' },
  sumTime: { fontSize: 22, fontWeight: '700', color: C.ink },
  sumCode: { fontSize: 13, fontWeight: '600', color: C.ink, marginTop: 4 },
  sumCity: { fontSize: 11, color: grey, marginTop: 2 },
  sumCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 14 },
  sumPaxRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.white, borderTopWidth: 1, borderStyle: 'dashed', borderColor: C.border },
  sumPaxLbl: { fontSize: 12, color: grey },
  sumSec: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 14 },
  sumPaxItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12 },
  sumPaxBorder: { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 12 },
  sumPaxNum: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#FDE8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sumPaxNumTxt: { fontSize: 14, fontWeight: '700', color: C.error },
  sumPaxName: { fontSize: 14, fontWeight: '700', color: C.ink },
  sumPaxMeta: { fontSize: 11, color: grey, marginTop: 2 },
  sumTypeTag: { backgroundColor: `${C.error}14`, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  sumTypeTagTxt: { fontSize: 11, fontWeight: '600', color: C.error },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  fareLbl: { fontSize: 13, color: C.ink },
  fareVal: { fontSize: 13, fontWeight: '600', color: C.ink },
  fareSep: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  fareTotalLbl: { fontSize: 15, fontWeight: '700', color: C.ink },
  fareTotal: { fontSize: 20, fontWeight: '700', color: C.error },
  ptsNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  ptsNoteTxt: { fontSize: 11, color: C.olive },
  policy: {
    backgroundColor: '#FFF8E6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE4A0',
    marginBottom: 24,
  },
  policyTxt: { fontSize: 12, color: '#7A5800', lineHeight: 18 },
  sumSticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  sumStickyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sumStickyLbl: { fontSize: 13, fontWeight: '500', color: grey },
  sumStickyAmt: { fontSize: 20, fontWeight: '700', color: C.error },
  procBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  procTxt: { fontSize: 15, fontWeight: '700', color: C.ink },
});
