"use strict";

// Clear, note-aligned CS144 bank: Keith Winstein, Winter 2025.
CARD_DATA["CS 144"] = { units: {
  "L00 · Course introduction and Internet origins": [
    [
      "What are the five learning goals of Winter 2025 CS144?",
      "Explain how the Internet works, build reliable services from unreliable parts, reason quantitatively about performance, implement a working TCP/IP stack, and evaluate design tradeoffs and failures."
    ],
    [
      "What was unusual about the earliest packet-switched Internet?",
      "It was a small experimental network connecting a few heterogeneous computers. Its success came from a minimal common packet service rather than one application-specific network."
    ],
    [
      "What service does the Internet layer try to provide?",
      "A best-effort datagram service: move an independently addressed packet toward its destination, without promising delivery, order, or uniqueness."
    ],
    [
      "Why does CS144 build the lab in checkpoints?",
      "Each checkpoint supplies one small contract—byte stream, reassembly, receiver, sender, interface, router—so the final network stack is understandable and testable as a composition."
    ],
    [
      "What is the best mental model for a networking layer?",
      "A service contract. Ask what objects cross the interface, what is promised, what may fail, and what stronger service the next layer builds."
    ],
    [
      "What is the collaboration boundary for the lab?",
      "Discuss concepts and debugging approaches, but write and understand your own implementation. Never submit code you cannot explain line by line."
    ],
    [
      "What should you do when a networking formula appears?",
      "Name every quantity and unit, draw the timeline or state diagram, then check limiting cases. Memorizing a bare formula is not enough."
    ],
    [
      "What is the Winter 2025 lecture sequence used by these cards?",
      "Keith Winstein's L00–L13 sequence: Internet origins; datagrams; reliability; service abstractions; TCP; packet switching; congestion control; home networking; NAT traversal; BGP; elasticity buffers; and security."
    ]
  ],
  "L01 · Datagrams, encapsulation, and multiplexing": [
    [
      "Core idea — What service does an IP datagram network promise?",
      "Best-effort delivery to the destination IP address. A datagram may be lost, duplicated, reordered, delayed, or corrupted; IP does not promise reliability."
    ],
    [
      "Core idea — What is encapsulation?",
      "One protocol object becomes the payload of another. On Ethernet, an IP datagram is the frame payload; inside IP, TCP or UDP is the payload; inside transport, application bytes are the payload."
    ],
    [
      "Trace — What is the outside-to-inside order for a DNS request sent over UDP on Ethernet?",
      "Ethernet frame → IP datagram → UDP datagram → DNS request."
    ],
    [
      "Core idea — What is multiplexing?",
      "Sharing one lower-level resource by using an identifier to dispatch each item to the right consumer, such as IP protocol numbers or TCP/UDP destination ports."
    ],
    [
      "Core idea — How does a host distinguish two connected TCP sockets?",
      "By protocol plus the local IP/port and remote IP/port. The connected socket is identified by the endpoint four-tuple, with TCP making the five-tuple."
    ],
    [
      "Exam check — What is in the first byte of an Ethernet frame's IPv4 payload?",
      "The beginning of the IPv4 header, including the IP version field. The Ethernet payload does not jump directly to UDP, TCP, or application data."
    ],
    [
      "Exam check — What value is in the IPv4 protocol field when the next header is UDP?",
      "17. The protocol field names the next encapsulated protocol; DNS port 53 belongs in the UDP header."
    ],
    [
      "Core idea — Why can reliability be built over UDP or IP?",
      "Reliability comes from endpoint behavior: sequence numbers, acknowledgments, checksums, timers, and retransmission. The lower service does not need to be reliable."
    ],
    [
      "Core idea — What makes an operation idempotent?",
      "Repeating it has the same relevant effect as doing it once. Assignment, set insertion, and the stated DELETE are idempotent; increment and a general POST are not."
    ],
    [
      "What four questions should you ask about any packet header?",
      "Who creates it, who reads it, what service decision it enables, and where it is removed or replaced."
    ],
    [
      "How are IP and UDP related?",
      "A UDP datagram is carried inside an IP datagram. IP selects the destination host; UDP ports select the destination process or socket on that host."
    ],
    [
      "Why is an IP datagram like a postcard?",
      "It carries a destination and payload and may be lost, duplicated, delayed, reordered, or inspected. Any stronger guarantee must be built above it."
    ]
  ],
  "L02 · Reliability from unreliability": [
    [
      "Core idea — What does an acknowledgment establish?",
      "It gives the sender evidence that a named item or contiguous prefix arrived. Without an ACK, the sender cannot distinguish loss from delay."
    ],
    [
      "Trace — What should a sender do when no ACK arrives before its timeout?",
      "Retransmit. The timeout converts silence into an action, although it may also create a duplicate if the original or ACK was merely delayed."
    ],
    [
      "Core idea — Why are sequence numbers needed when retransmitting?",
      "They let the receiver recognize which logical item arrived, discard duplicates, and place out-of-order data correctly."
    ],
    [
      "Core idea — Why is a checksum not enough for reliability?",
      "A checksum can detect many accidental corruptions, but it neither repairs data nor recovers a lost packet. The protocol still needs ACKs and retransmission."
    ],
    [
      "Core idea — Why are read-like requests easier to retry than actions?",
      "A repeated read is usually idempotent. Repeating an action such as transferring money may apply it twice unless the action has a unique request ID or duplicate suppression."
    ],
    [
      "Design check — Match failure to mechanism: loss, corruption, duplication, and reordering.",
      "Loss → timeout/retransmission; corruption → checksum and discard; duplication → sequence number/deduplication; reordering → sequence position and buffering."
    ],
    [
      "Core idea — What does the end-to-end principle suggest about reliability?",
      "Put correctness mechanisms at endpoints that know whether the application goal was achieved; lower layers may still add local optimizations."
    ],
    [
      "Why is retransmitting after a timeout not enough for exactly-once effects?",
      "The reply may be lost after the server performed the action. Retrying can repeat a non-idempotent action, so the protocol needs request identifiers and remembered results or another deduplication rule."
    ],
    [
      "How do sequence numbers help with a large message?",
      "They identify byte or segment positions, allowing the receiver to reorder data, notice holes, discard duplicates, and acknowledge a contiguous prefix."
    ],
    [
      "What does a cumulative ACK mean?",
      "It confirms that every sequence position before the ACK number has arrived contiguously; it does not necessarily confirm later out-of-order bytes."
    ],
    [
      "What is the key design question behind reliability?",
      "Reliable in what sense? Delivery, ordering, duplicate suppression, crash behavior, and application effects are separate promises."
    ]
  ],
  "L03 · Service abstractions and idempotence": [
    [
      "Core idea — What abstraction does TCP present to each application?",
      "Two independent, reliable, ordered, flow-controlled byte streams—one in each direction. TCP does not preserve write or message boundaries."
    ],
    [
      "Core idea — Why does naming every stream position make delivery idempotent?",
      "Placing bytes at positions 100–119 can be repeated without appending another copy. Duplicates and overlaps become bookkeeping."
    ],
    [
      "Core idea — What does TCP ACK number 500 mean?",
      "Every sequence-space item through 499 has arrived contiguously; the next item needed is 500."
    ],
    [
      "Core idea — Which TCP items consume sequence numbers?",
      "SYN consumes one, every payload byte consumes one, and FIN consumes one. A pure ACK consumes none."
    ],
    [
      "Trace — A segment starts at seq 100, has SYN, six payload bytes, and FIN. What ACK covers it?",
      "108: one position for SYN, six for data, and one for FIN."
    ],
    [
      "Core idea — Why does TCP use a random initial sequence number?",
      "It gives a new connection incarnation a fresh sequence-space region, reducing confusion with delayed segments from an older connection using the same endpoint addresses."
    ],
    [
      "Trace — What is the TCP three-way handshake?",
      "Client sends SYN x; server sends SYN y plus ACK x+1; client sends ACK y+1. It establishes both initial sequence numbers."
    ],
    [
      "Core idea — What is flow control?",
      "The receiver advertises how much sequence space it can currently accept, preventing the sender from overrunning finite receiver memory."
    ],
    [
      "Distinction — Receive window versus congestion window?",
      "The receive window protects the receiver. The congestion window protects the network. A sender may have at most the smaller usable amount in flight."
    ],
    [
      "Lab link — What are TCP's three position coordinates?",
      "32-bit wrapping sequence number; 64-bit absolute sequence number including SYN/FIN; and zero-based stream index excluding SYN/FIN."
    ],
    [
      "What is a service abstraction?",
      "A simpler interface that hides lower-layer details while making an explicit promise to its user—for example, TCP presenting ordered bytes above unreliable datagrams."
    ],
    [
      "Why are byte positions safer than an 'append these bytes' command?",
      "Repeating a write for the same positions is idempotent: duplicate transmissions describe the same final stream instead of appending duplicate data."
    ],
    [
      "Why does a new TCP connection need a fresh incarnation or ISN?",
      "Delayed packets from an old connection must not be mistaken for bytes in a new connection with the same endpoint addresses and ports."
    ],
    [
      "What is receiver flow control?",
      "The receiver advertises how much additional sequence space it can accept, preventing the sender from overrunning receiver memory."
    ]
  ],
  "L04 · Finishing TCP, handshake, flow control, and retransmission": [
    [
      "What are TCP's three sequence-number coordinate systems in the lab?",
      "A 64-bit stream index counts payload bytes; a 64-bit absolute sequence number also counts SYN and FIN; a 32-bit TCP sequence number is the absolute number wrapped around an ISN."
    ],
    [
      "Why is the ACK field not meaningful before a valid SYN?",
      "Before SYN, the receiver does not know the peer's initial sequence-number origin, so it cannot express a valid next-needed sequence number."
    ],
    [
      "What does the three-way handshake establish?",
      "Each endpoint proves reachability, announces its initial sequence number, and acknowledges the peer's initial sequence number: SYN, SYN+ACK, then ACK."
    ],
    [
      "Which TCP items consume sequence space?",
      "Each payload byte consumes one position; SYN consumes one; FIN consumes one. A pure ACK consumes none."
    ],
    [
      "What is bytes in flight?",
      "Sequence-consuming data sent but not cumulatively acknowledged. It includes SYN or FIN while either remains outstanding."
    ],
    [
      "How much may a TCP sender put in flight?",
      "At most the smaller of the receiver-advertised window and the congestion window, minus bytes already in flight."
    ],
    [
      "What does a cumulative ACK remove from the outstanding queue?",
      "Every outstanding sequence position strictly before the ACK number. Partially acknowledged segments require careful trimming or equivalent accounting."
    ],
    [
      "Which outstanding segment controls the retransmission timer?",
      "The oldest outstanding sequence-consuming segment. Sending newer data does not restart that segment's age."
    ],
    [
      "When is the retransmission timer reset?",
      "When a cumulative ACK advances and new outstanding data remains. Duplicate ACKs do not reset progress."
    ],
    [
      "When does the retransmission timeout back off?",
      "After an actual timeout retransmission with a nonzero advertised window. A zero-window probe is not evidence of congestion."
    ],
    [
      "What is TCP half-close?",
      "The two byte-stream directions end independently. One endpoint may send FIN and still receive data until the peer closes its direction."
    ],
    [
      "Why linger after both directions finish?",
      "A final ACK may be lost. Remaining alive briefly lets the endpoint acknowledge a retransmitted FIN instead of leaving the peer stuck."
    ],
    [
      "TCP accounting check: after SYN, N contiguous bytes, and FIN, what ACK is sent?",
      "ISN plus 1 for SYN, plus N data bytes, plus 1 for FIN, all modulo $2^{32}$. Do not count FIN until every earlier byte is assembled."
    ]
  ],
  "L05 · Packet switching, queueing, scheduling, and guarantees": [
    [
      "Core idea — Serialization delay versus propagation delay?",
      "Serialization $p/r$ is time to place a $p$-bit packet onto a rate-$r$ link. Propagation $l/c$ is time for the signal to travel link length $l$ at speed $c$."
    ],
    [
      "Core idea — What does store-and-forward mean?",
      "A switch or router waits for the entire packet to arrive before serializing that packet onto the next outgoing link."
    ],
    [
      "Formula — What is empty-queue delay across store-and-forward links?",
      "$\\sum_i(p/r_i+l_i/c_i)$, plus any stated processing delay. Include one serialization and one propagation term per link."
    ],
    [
      "Core idea — What causes queueing delay?",
      "A packet finishes arriving while the required output link is busy with earlier traffic, so it waits in the output queue."
    ],
    [
      "Exam method — How should you solve a two-packet timing problem?",
      "Draw when each packet starts and finishes input serialization, arrives fully at the router, starts output, and finishes output. Queueing is output-start minus full-arrival time."
    ],
    [
      "Formula — Queueing delay for a second back-to-back packet?",
      "$\\max(0,p_1/r_{out}-p_2/r_{in})$ when packet 2 follows packet 1 immediately and propagation is common to both."
    ],
    [
      "Core idea — What limits steady end-to-end throughput?",
      "The smallest link rate on the path: the bottleneck."
    ],
    [
      "Exam check — Why is propagation not multiplied by packet size?",
      "Propagation measures motion of signal energy over distance. Packet size affects how long serialization lasts, not how fast a bit travels."
    ],
    [
      "Core idea — What is FIFO scheduling?",
      "All packets share one queue and leave in arrival order. It is simple and work-conserving but provides no per-flow isolation or guaranteed share."
    ],
    [
      "Core idea — What is the danger of strict-priority scheduling?",
      "High-priority traffic can keep the link busy indefinitely, starving lower-priority queues unless high-priority load is bounded."
    ],
    [
      "Core idea — Why is one-packet-per-flow round robin unfair when packet sizes differ?",
      "A flow with larger packets sends more bits per turn. Fairness should approximate bit-by-bit sharing, not equal packet counts."
    ],
    [
      "Core idea — How does fair queueing choose the next packet?",
      "It models bit-by-bit round robin and sends packets in increasing virtual finish-time order."
    ],
    [
      "Core idea — What does weighted fair queueing add?",
      "Flow i receives at least its weight fraction $\\phi_iR$ while backlogged, where weights sum to one; unused shares are redistributed by a work-conserving scheduler."
    ],
    [
      "Core idea — What is a $(\\sigma,\\rho)$ traffic constraint?",
      "During any interval of length $t$, arrivals are at most $\\sigma+\\rho t$: burst size $\\sigma$ plus sustained rate $\\rho$."
    ],
    [
      "Core idea — How does a learning Ethernet switch forward?",
      "It learns source MAC-to-port mappings, sends known destinations to one port, and floods unknown or broadcast destinations to the other ports."
    ],
    [
      "Core idea — What steps does an IP router perform?",
      "Parse the datagram, find the longest-prefix matching route, drop if no route or TTL would reach zero, decrement TTL, then send to the route's next hop and interface."
    ],
    [
      "Trace — Why does 10.4.7.0/24 beat 10.0.0.0/8 for destination 10.4.7.90?",
      "Both prefixes match, but /24 fixes more leading bits and is therefore the more specific route."
    ],
    [
      "Core idea — Forwarding plane versus routing plane?",
      "The routing plane computes and installs routes. The forwarding plane applies the installed match-action table to each packet."
    ]
  ],
  "L06 · Why congestion control": [
    [
      "Core idea — What does congestion control protect?",
      "Shared network links and queues. It prevents senders collectively from creating excessive delay, loss, wasted retransmission, or congestion collapse."
    ],
    [
      "Core idea — What is congestion collapse?",
      "Increasing offered load causes useful delivered throughput to fall because links spend capacity on packets or retransmissions that cannot complete usefully."
    ],
    [
      "Distinction — Why is flow control not congestion control?",
      "A receiver can have plenty of memory while a router in the middle is overloaded. Flow control sees receiver capacity; congestion control reacts to path capacity."
    ],
    [
      "Core idea — What is maximum-utilization allocation?",
      "Choose rates that maximize total throughput. It can starve a multi-resource flow if single-link flows produce more total rate."
    ],
    [
      "Core idea — What is max-min fairness?",
      "Increase all rates together until a resource fills, freeze flows bottlenecked there, and continue increasing the others. No flow can be increased without reducing an equal-or-smaller flow."
    ],
    [
      "Core idea — What is proportional fairness?",
      "Choose feasible rates maximizing $\\sum_i\\log x_i$. It balances total efficiency with a strong preference against starving a flow."
    ],
    [
      "Worked result — Two 6 Mb/s links have one local flow each and one flow crossing both. What are the three standard allocations?",
      "Max-min: 3,3,3. Maximum utilization: 6,6,0. Proportional fairness: 4,4,2."
    ],
    [
      "Core idea — Why must congestion control be adaptive?",
      "An endpoint does not know all competing traffic, routes, or future capacity. It must infer conditions from feedback while the network changes."
    ],
    [
      "Where can a sender's outstanding bytes be?",
      "In transmission on links, queued in switches or routers, already at the receiver but not yet acknowledged, or represented by ACKs returning to the sender."
    ],
    [
      "Why can an oversized congestion window reduce useful throughput?",
      "It creates long queues, overflow loss, repeated work, and possibly congestion collapse, even though the sender is transmitting more bytes."
    ]
  ],
  "L07 · What congestion control, windows, self-clocking, and BDP": [
    [
      "Core idea — What is the bandwidth-delay product?",
      "Bottleneck rate × minimum RTT. It is the amount of unacknowledged data needed to keep an empty-queue path continuously busy."
    ],
    [
      "Core idea — What does ACK self-clocking mean?",
      "Returning ACKs release permission to send new data at roughly the rate the bottleneck delivered old data."
    ],
    [
      "Exam method — If path length increases, what happens to the ideal window?",
      "Minimum RTT increases, so BDP increases. Recompute BDP before stating the new AIMD minimum, maximum, or buffer."
    ],
    [
      "Core idea — What bounds bytes in flight at a TCP sender?",
      "The usable amount is limited by both the receiver-advertised window and congestion window, approximately $\\min(rwnd,cwnd)$."
    ],
    [
      "What two independent limits constrain TCP flight size?",
      "Receiver flow control gives $rwnd$; congestion control gives $cwnd$. The sender obeys roughly $min(rwnd,cwnd)$."
    ],
    [
      "Why does one BDP fill an empty path in the simple model?",
      "While one window's worth of data is in flight, the first ACK returns just as the bottleneck would otherwise become idle, allowing continuous transmission without a standing queue."
    ],
    [
      "For a 5 Mb/s bottleneck and 100 ms minimum RTT, what is one BDP?",
      "$5{,}000{,}000,\text{bit/s}\times0.1,\text{s}=500{,}000$ bits = 62,500 bytes."
    ],
    [
      "Why can't a sender simply set cwnd to the path's BDP?",
      "It usually does not know the bottleneck rate, base RTT, competing flows, or future route. It must infer capacity from ACK timing and congestion signals."
    ],
    [
      "What observable events can signal congestion?",
      "Packet loss, rising delay, or explicit congestion notification. Each is imperfect and arrives after conditions have already changed."
    ]
  ],
  "L08 · How congestion control, AIMD, slow start, and buffers": [
    [
      "Core idea — State AIMD.",
      "Additive increase: raise the congestion window gradually, about one segment per RTT. Multiplicative decrease: cut it, classically in half, when congestion is inferred."
    ],
    [
      "Formula — In the classic one-flow AIMD model, what buffer keeps utilization after halving?",
      "One BDP. Loss occurs near two BDP outstanding; halving returns the window to one BDP."
    ],
    [
      "Core idea — What is slow start?",
      "Begin with a small congestion window and add roughly one segment per ACK, causing the window to double each RTT until a threshold or congestion signal."
    ],
    [
      "Core idea — Why is packet loss an ambiguous congestion signal?",
      "Loss may come from queue overflow, corruption, route changes, or policy. Classic TCP generally treats loss as congestion because endpoints lack a perfect signal."
    ],
    [
      "What per-ACK update gives about one segment of additive increase per RTT?",
      "Increase $cwnd$ by approximately $MSS^2/cwnd$ for each ACK that acknowledges new data."
    ],
    [
      "Why does slow start grow exponentially?",
      "It adds about one MSS per ACK. One window produces roughly one window's worth of ACKs, so cwnd approximately doubles each RTT."
    ],
    [
      "In the classic one-flow model, when does loss occur with a one-BDP buffer?",
      "The path holds one BDP in propagation plus one BDP in the full queue, so loss begins near two BDP outstanding."
    ],
    [
      "Why does halving from two BDP preserve utilization?",
      "The new one-BDP window still keeps the empty path full while the queue drains, so the bottleneck can remain busy."
    ],
    [
      "Why do many synchronized TCP flows require less than one BDP of buffering in some models?",
      "Their independent window fluctuations partly average out; the aggregate rarely falls by half at exactly the same instant, though assumptions matter."
    ]
  ],
  "L09 · The eras tour of home networking": [
    [
      "Core idea — What does DHCP provide a new home-network client?",
      "A leased client IP address plus subnet information, default-router address, DNS-resolver address, and other configuration."
    ],
    [
      "Core idea — What question does ARP answer?",
      "On the local link: which Ethernet address currently corresponds to this next-hop IPv4 address?"
    ],
    [
      "Core idea — What question does DNS answer?",
      "Which resource records, commonly IP addresses, correspond to a domain name?"
    ],
    [
      "Trace — When sending to a remote server, whose MAC address goes in the first Ethernet frame?",
      "The local default router's MAC address, not the remote server's. ARP resolves the next hop on the local link."
    ],
    [
      "Core idea — What is NAPT?",
      "A home gateway rewrites private source IP/port pairs to its public IP and chosen external ports, maintaining reverse mappings for replies."
    ],
    [
      "Core idea — Why did NAT become common?",
      "IPv4 address scarcity and convenient home-network sharing, although it also created accidental inbound filtering and broke end-to-end reachability."
    ],
    [
      "Core idea — What functions are commonly inside a home router?",
      "IP routing, NAPT, DHCP server, DNS forwarding/resolution, Ethernet switching, Wi-Fi access point, and often the cable/fiber modem."
    ],
    [
      "Core idea — Transparent proxy versus explicit proxy?",
      "An explicit proxy is configured and addressed by the client. A transparent proxy intercepts traffic without the application deliberately selecting it."
    ],
    [
      "What changes as the home-networking 'levels' increase?",
      "More hosts share one access link, configuration becomes automatic, private addressing appears, and a gateway combines routing, DHCP, DNS forwarding, switching, Wi-Fi, and NAPT."
    ],
    [
      "At Level 6, what does an explicit proxy or jump host change?",
      "The client knowingly connects to an intermediary, which then creates the external connection on the client's behalf."
    ],
    [
      "At Level 7, what makes a proxy transparent?",
      "The network intercepts and redirects traffic without the application explicitly selecting the proxy."
    ]
  ],
  "L10 · NAPT traversal and peer-to-peer networking": [
    [
      "Core idea — Level 9a P2P?",
      "Both users communicate through a public file server that stores the object for later download. It needs file-sized persistent state and serving bandwidth."
    ],
    [
      "Core idea — Level 9b P2P?",
      "Both users connect to a public relay/TURN server that forwards the live stream. It needs data-proportional network resources but not a lasting copy."
    ],
    [
      "Core idea — Level 9c P2P?",
      "A user manually installs a port-forwarding rule so unsolicited inbound traffic reaches the internal host. No developer relay is required."
    ],
    [
      "Core idea — Level 9d P2P?",
      "NAT traversal/hole punching: peers learn public mappings, exchange them through rendezvous, then create compatible outbound NAT state and communicate directly."
    ],
    [
      "Core idea — What does STUN provide?",
      "It lets a client learn the public IP/port mapping that a NAT created for its outbound traffic."
    ],
    [
      "Core idea — What does a rendezvous server provide?",
      "It introduces peers and exchanges their observed public endpoints and coordination messages; it need not carry bulk data."
    ],
    [
      "Exam check — Which levels normally require public developer services?",
      "9a, 9b, and 9d. Level 9c relies on user-installed forwarding."
    ],
    [
      "Exam check — Which level requires a sufficiently permissive cone-like NAT?",
      "9d hole punching."
    ],
    [
      "Design check — Why is relay the compatibility fallback?",
      "Both peers can usually initiate ordinary outbound connections to a public server, even when direct inbound mappings or hole punching fail."
    ],
    [
      "Why does ordinary outbound NAPT work easily?",
      "The first outbound packet creates state binding an internal address and port to a public address and port; replies matching that state can be translated back."
    ],
    [
      "What determines whether hole punching succeeds?",
      "The NATs' mapping and filtering behavior, stable enough public candidates, coordinated outbound traffic, and firewall policy. Relay is needed when these conditions fail."
    ]
  ],
  "L11 · Internet interconnection, BGP, and routing policy": [
    [
      "What is an autonomous system (AS)?",
      "A network or group of networks under one administrative policy that presents a common routing identity to the Internet."
    ],
    [
      "What is the difference between transit and peering?",
      "A customer pays a provider for reachability to the wider Internet; peers exchange traffic for their own and their customers' prefixes, usually without providing each other full transit."
    ],
    [
      "What does BGP advertise?",
      "Reachability to IP prefixes together with path attributes, especially an AS path. It is a path-vector protocol, not global shortest-path routing."
    ],
    [
      "Why is the AS path useful?",
      "It shows which autonomous systems an advertisement traversed and prevents loops because an AS rejects a route containing its own number."
    ],
    [
      "What does local preference express?",
      "An AS's internal business preference among routes. Higher local preference is normally considered before shorter AS path."
    ],
    [
      "What is the usual policy preference among customer, peer, and provider routes?",
      "Prefer customer routes, then peer routes, then provider routes, because customer traffic earns revenue while provider transit costs money."
    ],
    [
      "What is the valley-free export rule?",
      "Export customer-learned routes broadly, but export peer- or provider-learned routes only to customers. Do not offer free transit between peers or providers."
    ],
    [
      "After local preference, what common attributes influence BGP selection in the lecture model?",
      "Shorter AS path, then MED when comparable, then hot-potato choice of the closest egress by the internal routing metric."
    ],
    [
      "What is the difference among eBGP, iBGP, and an IGP?",
      "eBGP exchanges routes between ASes; iBGP distributes chosen external routes inside an AS; an IGP such as OSPF finds internal paths and egress costs."
    ],
    [
      "What is hot-potato routing?",
      "Choose the nearest acceptable exit from the local AS, minimizing the local network's internal cost even if the end-to-end path is not shortest."
    ],
    [
      "How do prefixes make Internet routing scalable?",
      "One prefix can summarize many destination addresses, so routers select by longest-prefix match rather than store a separate route for every host."
    ],
    [
      "What is a BGP prefix hijack?",
      "An AS originates or propagates an unauthorized route to someone else's prefix, attracting traffic because policy or prefix specificity makes the false route preferable."
    ],
    [
      "What is the safest exam recipe for BGP policy questions?",
      "List candidate routes, reject loops and forbidden exports, apply local preference, then AS-path length, MED where applicable, and hot-potato cost. State whose policy you are applying."
    ]
  ],
  "L12 · Elasticity buffers and clock tolerance": [
    [
      "Core idea — What problem does an elasticity buffer solve?",
      "It absorbs the small rate mismatch between independently clocked sender and receiver while preserving frame boundaries."
    ],
    [
      "Core idea — Why begin reading around half-full?",
      "Starting near the midpoint leaves room in both directions: faster sender can grow occupancy and faster receiver can drain it without immediate overflow or underflow."
    ],
    [
      "Trace — What are the occupancy slopes while sender and receiver both run and during a gap?",
      "During packet reception: $r_s-r_r$. During a gap while the receiver drains: $-r_r$."
    ],
    [
      "Core idea — Why does MTU affect required buffer size?",
      "A larger maximum frame makes the sender and receiver run at mismatched rates for longer before a safe frame boundary can pause or resume reading."
    ],
    [
      "Approximation — If each clock may differ by ±ε, what is worst relative drift?",
      "Approximately $2ε$: one endpoint may be ε fast while the other is ε slow."
    ],
    [
      "Lecture approximation — What buffer and gap scale with clock tolerance?",
      "$B\\ge4\\,MTU\\,ε$ and $p\\ge2\\,MTU\\,ε/r$ under the lecture's small-drift model."
    ],
    [
      "Exam method — What labels belong on an elasticity-buffer graph?",
      "Every change time, occupancy B/2 or B as applicable, and slopes $r_s$, $r_s-r_r$, $-r_r$, or 0 for each segment."
    ],
    [
      "Exact-model check — How much can the receiver drain during a gap p from occupancy y?",
      "$\\min(y,pr_r)$."
    ],
    [
      "What exact conditions must an elasticity buffer avoid?",
      "Occupancy must never exceed capacity and must never fall below zero while the receiver is reading. Check both during maximum frames and during inter-frame gaps."
    ],
    [
      "Why do Ethernet MTU and inter-packet gap both matter?",
      "The MTU bounds how long positive drift can accumulate during a frame; the gap gives a faster receiver time to drain excess occupancy before the next frame."
    ],
    [
      "What is the safest elasticity-buffer workflow?",
      "Write the occupancy slope for each interval, calculate occupancy at every boundary, then impose $0le q(t)le B$ and solve for the requested buffer or gap."
    ]
  ],
  "L13 · Security, TLS, certificates, and Tor": [
    [
      "Core idea — Why is an Internet checksum not an adversarial integrity mechanism?",
      "It has no secret. An attacker can alter the payload and recompute a matching checksum."
    ],
    [
      "Core idea — What does a MAC provide?",
      "Integrity and source authentication between parties sharing a secret key; it does not by itself encrypt the message."
    ],
    [
      "Core idea — What does AEAD provide?",
      "Confidentiality plus authenticated integrity for plaintext and selected associated data, under a shared secret and nonce discipline."
    ],
    [
      "Core idea — What does authenticated key exchange accomplish?",
      "Peers agree on fresh session keys while authenticating the intended peer, resisting an active man-in-the-middle."
    ],
    [
      "Core idea — What does a digital signature provide?",
      "Anyone with the public key can verify that the private-key holder signed a message. It provides public verifiability, unlike a shared-key MAC."
    ],
    [
      "Core idea — What does a Web certificate assert?",
      "A certification authority signs a binding between a hostname/identity and a public key, subject to validity and policy constraints."
    ],
    [
      "Trace — What does TLS add above TCP?",
      "Server authentication, key establishment, then an encrypted and integrity-protected byte stream/record layer for application protocols such as HTTP."
    ],
    [
      "Core idea — What is certificate transparency for?",
      "Public append-only logs make issued certificates auditable, helping domain owners and browsers detect mistaken or malicious issuance."
    ],
    [
      "Core idea — What can encryption fail to hide?",
      "Metadata such as endpoint IPs, timing, packet sizes, and traffic volume can remain visible even when payloads are confidential."
    ],
    [
      "Core idea — How does onion routing improve privacy?",
      "Traffic passes through layered relays so no single relay normally knows both the user and final destination, although timing correlation remains a threat."
    ],
    [
      "What should every security answer name first?",
      "The attacker and threat model: what the attacker can observe, modify, inject, replay, or impersonate."
    ],
    [
      "What checks must a browser perform on a certificate?",
      "Hostname match, trusted chain to a root CA, validity interval, allowed use, signatures, and relevant revocation or transparency policy."
    ],
    [
      "What privacy limitation remains for Tor?",
      "A sufficiently capable observer may correlate entry and exit timing and volume. Tor reduces who sees both endpoints; it does not make traffic analysis impossible."
    ]
  ],
  "S01 · DNS, HTTP, and adaptive video streaming": [
    [
      "What questions do ARP, DNS, and DHCP answer?",
      "ARP maps a next-hop IPv4 address to a local-link MAC; DNS maps names to records; DHCP supplies a host's address and network configuration."
    ],
    [
      "Why is DNS distributed and cached?",
      "No single server must answer every name, authority is delegated by zones, and cached answers reduce latency and load until their TTL expires."
    ],
    [
      "What happens before a browser can send an HTTP request to a new hostname?",
      "It obtains network configuration if needed, resolves the hostname with DNS, chooses a route and next hop, resolves the next-hop MAC locally, establishes transport, then sends HTTP."
    ],
    [
      "What abstraction does HTTP normally use from TCP?",
      "An ordered byte stream. HTTP defines message syntax and meaning; TCP does not preserve HTTP message boundaries."
    ],
    [
      "Why did HTTP/1.1 add persistent connections?",
      "Several requests can reuse one TCP connection, avoiding repeated handshakes and slow-start restarts."
    ],
    [
      "What is head-of-line blocking?",
      "Later useful data waits behind an earlier missing or blocked item even when it could otherwise be processed."
    ],
    [
      "How does adaptive-bitrate video choose a representation?",
      "It estimates sustainable throughput and buffer health, then selects a bitrate likely to finish before playback drains the buffer."
    ],
    [
      "How do you compute a video chunk's download time?",
      "Chunk bits divided by measured goodput. If bitrate is $b$ and playback duration is $T$, size is $bT$ bits and download time is $bT/g$."
    ],
    [
      "When is playback time added to an adaptive-video buffer?",
      "Only when the whole chunk finishes downloading; meanwhile playback continuously drains the existing buffer."
    ],
    [
      "What table prevents adaptive-video exam mistakes?",
      "For each chunk record start time, selected bitrate, size, goodput, finish time, and buffer before and after completion."
    ]
  ],
  "S02 · Dijkstra, Bellman–Ford, and routing exam problems": [
    [
      "Core idea — Flooding, source routing, and distributed routing?",
      "Flooding copies widely; source routing puts the path in the packet; distributed routing has routers compute next hops from exchanged information."
    ],
    [
      "Core idea — State Bellman–Ford's update.",
      "$D_x(y)=\\min_{v\\in N(x)}\\{c(x,v)+D_v(y)\\}$: choose the neighbor offering the lowest link cost plus advertised remaining distance."
    ],
    [
      "Core idea — What information does distance-vector routing exchange?",
      "Each router tells neighbors its current distance estimate to destinations, not the complete topology."
    ],
    [
      "Core idea — What is count to infinity?",
      "After a failure, neighbors can repeatedly believe each other has a path and increase a bad distance one step at a time."
    ],
    [
      "Core idea — What information does link-state routing flood?",
      "Authenticated/reliable descriptions of local links and costs. Every router then runs Dijkstra on the learned topology."
    ],
    [
      "Exam method — How do you run Dijkstra safely?",
      "Maintain tentative distances and predecessors, repeatedly finalize the smallest tentative node, and relax each outgoing edge. Keep a table instead of tracing mentally."
    ],
    [
      "Core idea — RIP, OSPF, and BGP correspond to what styles?",
      "RIP is distance vector, OSPF is intra-domain link state, and BGP is inter-domain path vector with policy."
    ],
    [
      "Exam method — Largest shortest path versus Bellman–Ford rounds?",
      "Largest shortest path maximizes cost after minimizing per pair. Convergence rounds follow the greatest hop count needed by a shortest route, not the greatest cost."
    ],
    [
      "Exam method — How many edges are in a spanning tree with V routers?",
      "$V-1$. Run the requested shortest-path algorithm first, then remove non-tree edges."
    ],
    [
      "Core idea — Why is BGP not simply global Dijkstra?",
      "Autonomous systems apply business and security policies, hide internal details, and select policy-compliant paths rather than one universal additive metric."
    ]
  ],
  "S03 · Shannon capacity, coding, and physical-layer exam problems": [
    [
      "Formula — State Shannon capacity.",
      "$C=W\\log_2(1+S/N)$, where $W$ is channel bandwidth in hertz, $S$ signal power, and $N$ noise power."
    ],
    [
      "Exam check — Do 100–200 MHz and 5.0–5.1 GHz have the same Shannon bandwidth?",
      "Yes. Each band is 100 MHz wide. Center frequency is not the $W$ in Shannon's formula."
    ],
    [
      "Core idea — What happens to Shannon capacity when shielding reduces noise?",
      "$N$ decreases, so $S/N$ and capacity increase if the other terms stay fixed."
    ],
    [
      "Core idea — ASK, FSK, and PSK change what?",
      "Amplitude-shift keying changes amplitude; frequency-shift keying changes frequency; phase-shift keying changes phase."
    ],
    [
      "Core idea — What does an I/Q constellation represent?",
      "Each point is a symbol with an in-phase and quadrature component, equivalently an amplitude and phase."
    ],
    [
      "Formula — How many bits can an M-point constellation encode per symbol?",
      "$\\log_2 M$. QPSK has 4 points and 2 bits/symbol; 16-QAM has 16 points and 4 bits/symbol."
    ],
    [
      "Core idea — Why do independent sender and receiver clocks need recovery or buffering?",
      "Their actual rates differ slightly. Without correction, sampling drifts or a receive buffer eventually underflows/overflows."
    ],
    [
      "Core idea — What problem does Manchester coding solve?",
      "It guarantees a transition within each bit period, making clock recovery easy, at the cost of more signal transitions/bandwidth."
    ],
    [
      "Core idea — What does 4b/5b coding accomplish?",
      "It maps four data bits to five-bit codewords chosen to limit long runs without transitions, helping clock recovery with less overhead than Manchester."
    ]
  ],
  "Checkpoints 0–1 · ByteStream and reassembly": [
    [
      "Checkpoint 0 — What are the ByteStream accounting identities?",
      "Bytes buffered = bytes pushed − bytes popped; available capacity = total capacity − bytes buffered."
    ],
    [
      "Checkpoint 0 — Closed versus finished?",
      "Closed means the writer will add no more bytes. Finished means it is closed and the reader has drained every buffered byte."
    ],
    [
      "Checkpoint 0 — Why must a Web client read until EOF?",
      "TCP is a stream and individual reads may be short. Connection closure, not one read call, marks the end when the HTTP request uses Connection: close."
    ],
    [
      "Checkpoint 1 — What receive interval is useful when the next unassembled index is a and available capacity is C?",
      "Only $[a,a+C)$. Earlier bytes are duplicates; later bytes exceed currently promised memory."
    ],
    [
      "Checkpoint 1 — How should overlapping substrings be counted?",
      "Merge their union and count each stream index once. Pending-byte count is unique useful bytes, not the sum of received lengths."
    ],
    [
      "Checkpoint 1 — When may the reassembler close its output?",
      "When a final index has been announced and the next unassembled index reaches exactly that final index."
    ],
    [
      "Checkpoint 1 — Why can out-of-order bytes not enter the ByteStream immediately?",
      "The application expects one contiguous ordered stream. The receiver must retain bytes after a hole until every earlier byte is known."
    ],
    [
      "Debug check — Which interval convention prevents endpoint double counting?",
      "Half-open intervals $[start,end)$."
    ]
  ],
  "Checkpoint 2 · Wrapping integers and TCP receiver": [
    [
      "Checkpoint 2 — What does wrap(n, ISN) compute?",
      "ISN + n modulo $2^{32}$, converting a 64-bit absolute sequence position to TCP's 32-bit sequence number."
    ],
    [
      "Checkpoint 2 — Why does unwrap need a checkpoint?",
      "One 32-bit value represents infinitely many absolute positions separated by $2^{32}$. The checkpoint chooses the nearest plausible one."
    ],
    [
      "Checkpoint 2 — What is the receiver's absolute ACK offset after SYN, N assembled bytes, and FIN?",
      "$1+N+1$. Omit the final one until FIN is assembled after every preceding byte."
    ],
    [
      "Checkpoint 2 — What should a receiver do with data before any valid SYN?",
      "Ignore it because the receiver has no initial sequence-number origin for that connection."
    ]
  ],
  "Checkpoint 3 · TCP sender, timers, and Linux interoperation": [
    [
      "Checkpoint 3 — What should fill_window send?",
      "As much SYN/data/FIN as fits the receiver's effective window, assigning sequence numbers and tracking every sequence-consuming message as outstanding."
    ],
    [
      "Checkpoint 3 — Why treat a zero advertised window as one for probing?",
      "A one-position probe lets the sender discover when the receiver reopens its window; otherwise both could wait forever."
    ],
    [
      "Checkpoint 3 — Which message does the retransmission timer protect?",
      "The oldest outstanding sequence-consuming message. Later sends do not restart its age."
    ],
    [
      "Checkpoint 3 — When does RTO double?",
      "After timeout retransmission when the advertised window is nonzero. Do not back off a zero-window probe as if it proved congestion."
    ],
    [
      "Checkpoint 3 — What resets RTO and consecutive retransmissions?",
      "An ACK that advances cumulative acknowledgment. A duplicate ACK does not."
    ],
    [
      "Checkpoint 3 — Does an empty control message consume sequence space?",
      "No. It should not enter the outstanding queue or start the retransmission timer."
    ],
    [
      "How do tcp_ipv4 and tcp_native differ in the Winter 2025 lab?",
      "tcp_ipv4 runs the student TCP implementation over a TUN interface; tcp_native uses the operating system's TCP. Comparing them tests the same application over two transports."
    ],
    [
      "What is tun.sh for?",
      "It creates and configures the virtual network interface and routes needed to exchange IPv4 datagrams with the student TCP stack."
    ],
    [
      "What should you inspect with tcpdump during interoperation?",
      "SYN/SYN-ACK/ACK progression, sequence and ACK numbers, advertised windows, retransmissions, FIN behavior, and whether packets use the expected addresses and ports."
    ],
    [
      "What sizes should the checkpoint's one-megabyte transfer tests include?",
      "The specified challenge sizes 12, 65,534, 65,537, 200,000, and 1,000,000 bytes, because boundary sizes expose wrapping and segmentation mistakes."
    ],
    [
      "Why should webget use CS144TCPSocket and wait_until_closed?",
      "It proves the application uses the student TCP stack and waits through clean connection shutdown instead of exiting after one short read."
    ]
  ],
  "Checkpoint 4 · Real-world TCP measurement": [
    [
      "What is Checkpoint 4 in Winter 2025?",
      "A measurement assignment, not another implementation checkpoint: observe real Internet loss, correlation, RTT, queueing, and path differences."
    ],
    [
      "How many paths should the measurement study compare?",
      "Three meaningfully different paths, measured long enough—about an hour or more—to reveal loss and delay behavior."
    ],
    [
      "At five pings per second, how many probes occur in one hour?",
      "$5\times3600=18{,}000$ probes."
    ],
    [
      "What does lag-$k$ delivery autocorrelation test?",
      "Whether success or loss at one probe predicts a probe $k$ positions away. Positive nearby correlation suggests bursty conditions."
    ],
    [
      "Which lags does the checkpoint request?",
      "$k=-10,-9,ldots,0,ldots,9,10$."
    ],
    [
      "How should RTT be summarized?",
      "Report minimum and maximum, plot RTT over time, show its empirical CDF, and make an adjacent-sample scatterplot such as $RTT_n$ versus $RTT_{n+1}$."
    ],
    [
      "Why is minimum RTT important?",
      "It approximates propagation and transmission without much queueing; excess above the minimum is a rough queueing-delay signal."
    ],
    [
      "Why run brief higher-rate experiments?",
      "They reveal whether your own probing load changes queueing, loss, or correlation, while avoiding an unnecessarily long aggressive measurement."
    ],
    [
      "What should the final checkpoint comparison explain?",
      "How the paths differ in baseline RTT, variability, loss rate, burstiness, and likely causes, while separating evidence from speculation."
    ]
  ],
  "Checkpoints 5–7 · ARP, routing, and end-to-end integration": [
    [
      "Checkpoint 5 — What happens when the next-hop MAC is unknown?",
      "Queue the IP datagram, broadcast an ARP request unless one was sent for that IP within five seconds, then flush queued datagrams when a mapping is learned."
    ],
    [
      "Checkpoint 5 — From which ARP messages should the interface learn?",
      "Both requests and replies, using the sender IP and sender Ethernet address; cache the mapping for the specified lifetime."
    ],
    [
      "Checkpoint 6 — What is longest-prefix match?",
      "Among all routes whose high-order prefix bits match the destination, choose the route with the greatest prefix length."
    ],
    [
      "Checkpoint 6 — When does the router drop for TTL?",
      "If TTL is already zero or decrementing it would make it zero. A packet with TTL 1 cannot be forwarded another hop."
    ],
    [
      "Checkpoint 6 — Direct route versus route through a gateway?",
      "For a direct route, next-hop IP is the datagram destination. Otherwise use the route's explicit next-hop router IP."
    ],
    [
      "Checkpoint 7 — Why test against your own stack before another student's?",
      "Self-test localizes basic integration bugs; an independent peer then reveals hidden assumptions shared by two copies of your implementation."
    ],
    [
      "Checkpoint 7 — What does matching SHA-256 on a transferred random file establish?",
      "Strong evidence that the full stack delivered exactly the same bytes without loss, insertion, corruption, or reordering."
    ],
    [
      "Checkpoint 7 — What is TCP half-close?",
      "Each byte-stream direction ends independently. One side can send FIN yet continue receiving until the peer ends its own stream."
    ]
  ],
  "Lab FAQ · Debugging, testing, Git, and code quality": [
    [
      "What should you do before changing code for a failed test?",
      "Reduce the failure to the smallest reproducible case and write down expected state before and after the operation."
    ],
    [
      "Why are invariants better than scattered special cases?",
      "An invariant gives every method one shared truth to preserve, making overlap, capacity, timer, and sequence-number bugs easier to localize."
    ],
    [
      "What should an assert express?",
      "A condition that must be true if the program's internal logic is correct—not ordinary malformed network input that should be handled safely."
    ],
    [
      "Why test boundary values around $2^{32}$?",
      "TCP wire sequence numbers wrap there. Values just below, at, and above the boundary expose incorrect signed arithmetic or nearest-checkpoint logic."
    ],
    [
      "What belongs in a useful Git commit?",
      "One coherent change, a message describing the reason, and a state that builds and passes the relevant tests."
    ],
    [
      "Why should logs include state transitions rather than only events?",
      "'ACK received' is weak; recording old and new ACK, bytes in flight, window, timer, and outstanding queue explains why behavior changed."
    ],
    [
      "What is the best order for debugging the full stack?",
      "Unit test each layer, verify local self-interoperation, inspect packets, then test against an independent implementation or partner."
    ],
    [
      "What code-quality question matters most in the lab?",
      "Can you state the invariant and explain why every branch preserves it? Short code is useful only when its behavior remains clear."
    ]
  ],
  "Practice exams · Recurring solution methods": [
    [
      "Exam method — TCP segment table?",
      "Track each direction separately; SYN and FIN consume one; ACK is the next peer position needed; and payload plus flags must fit the peer's advertised window."
    ],
    [
      "Exam method — Store-and-forward delay?",
      "Write one $p/r$ and one $l/c$ term per traversed link, then add queueing and stated processing. Draw a timeline for multiple packets."
    ],
    [
      "Exam method — BDP and classic AIMD?",
      "Find minimum RTT and bottleneck rate; BDP = rate × RTT. Ideal no-queue window is one BDP; classic one-flow buffer is one BDP; pre-loss window is two BDP."
    ],
    [
      "Exam method — Routing diameter?",
      "Compute shortest paths first, then choose the pair with the largest minimum cost. Do not choose the longest visible path."
    ],
    [
      "Exam method — Bellman–Ford convergence?",
      "Use the largest hop count needed by any shortest route under the exam's synchronous-round convention, not the route's numeric cost."
    ],
    [
      "Exam method — Fair queueing throughput?",
      "Find downstream caps first, apply scheduler shares to backlogged flows, and redistribute unused capacity because the scheduler is work-conserving."
    ],
    [
      "Exam method — Proportional fairness for A+C≤6 and B+C≤6?",
      "Use symmetry A=B=6−C and maximize $2\\log(6-C)+\\log C$; derivative gives A=B=4 and C=2."
    ],
    [
      "Exam method — Adaptive video?",
      "Maintain a table of chunk start, finish, selected bitrate, and buffer. Download time = bitrate × chunk duration ÷ goodput; subtract playback time and add a chunk only when complete."
    ],
    [
      "Exam method — NAT/P2P resource comparison?",
      "Separate persistent storage, live relay bandwidth, coordination-only servers, and NAT assumptions. Do not treat every public server as carrying bulk data."
    ],
    [
      "Exam method — Security mechanism question?",
      "Name the threat, the secret or trust anchor, and the exact property. Checksums handle accidents; MAC/AEAD handle malicious modification; certificates bind names to public keys."
    ],
    [
      "Exam method — Elasticity-buffer graph?",
      "Mark B/2 and B, label each slope, and calculate occupancy at every slope change before solving for the smallest B or gap."
    ],
    [
      "Correction — In SP23 Final Q7(c), what is the zero-queue condition?",
      "$p_2/r_{in}\\ge p_1/r_{out}$, so the 10-kbit/1-to-10-Mb/s example needs $p_2\\ge1$ kbit. The official key's ≤ sign is reversed."
    ],
    [
      "Correction — What persistent-state answer belongs to SP23 Final P2P Q6(c)?",
      "Level 9a only. A file server retains file-sized state between connections; a 9b relay handles live bytes but need not retain a file-sized copy afterward."
    ],
    [
      "Exam habit — What should you do when packet or ACK size is unspecified?",
      "State the assumption, solve under it, and briefly identify how the alternative would change the expression."
    ],
    [
      "Exam method — BGP route selection?",
      "Remove loops and policy-forbidden exports, then apply the stated local preference, AS-path length, MED where comparable, and hot-potato IGP cost in that order."
    ],
    [
      "Exam method — Customer, peer, or provider export?",
      "A route learned from a customer may be exported to anyone; a route learned from a peer or provider is normally exported only to customers."
    ],
    [
      "Exam method — TCP ACK/window table?",
      "Use one row per packet and one coordinate system at a time. Mark SYN/FIN consumption, payload interval, cumulative ACK, advertised window, and bytes in flight."
    ],
    [
      "Exam method — Checkpoint 4 statistics?",
      "Define the random variables first, show the denominator for conditional probabilities or correlation, and interpret the plot without claiming a cause the data cannot prove."
    ]
  ]
} };
