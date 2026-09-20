"use strict";

// Note-aligned replacement banks for the three courses revised in September 2026.
// Prompts say whether they test a core idea, a trace, or an exam method.

CARD_DATA["CS 111"] = { units: {
  "L02–L04 · Files, inodes, and directories": [
    ["Core idea — What job does a filesystem perform above a raw disk?", "It turns numbered storage blocks into persistent named files and directories, while tracking metadata, allocation, protection, and recovery."],
    ["Core idea — What is the difference between a disk block and a file?", "A block is a fixed-size physical storage unit. A file is a logical byte sequence whose metadata tells the filesystem which blocks hold its contents."],
    ["Core idea — What belongs in a Unix inode, and what belongs in a directory entry?", "The inode stores the file's type, size, permissions, link count, and block addresses. A directory entry stores a name and the inode number that name refers to."],
    ["Trace — How does pathname lookup resolve <code>/a/b</code>?", "Start at the root directory's inode, search it for <code>a</code>, load that inode and verify it is a directory, then search it for <code>b</code>. Each component is a separate directory lookup."],
    ["Trace — For block size $B$, which logical block and byte offset contain file byte $o$?", "Logical block $=\\lfloor o/B\\rfloor$ and offset inside that block $=o\\bmod B$. The inode's indexing structure then maps the logical block to a disk block."],
    ["Core idea — Why do inodes use direct and indirect block pointers?", "Direct pointers make small files cheap. Indirect blocks add more pointer levels only when a file grows, allowing large files without making every inode huge."],
    ["Trace — What is the safe method for a doubly indirect lookup?", "First subtract the bytes covered by direct and singly indirect regions. Divide the remaining logical-block index by the pointers per indirect block: quotient selects the first-level block and remainder selects the final data pointer."],
    ["Core idea — What does a hard link create?", "Another directory name for the same inode. Both names reach the same file data and metadata, and the inode's link count increases."],
    ["Core idea — How is a symbolic link different from a hard link?", "A symbolic link is its own file containing a pathname. Path lookup follows that text, so it can cross filesystems or become dangling."],
    ["Core idea — When may the filesystem reclaim an unlinked file?", "Only after no directory links name the inode and no open-file descriptions still refer to it. Removing the last name does not invalidate an already-open descriptor."],
    ["Core idea — Why can a sparse file be logically large but physically small?", "Unwritten logical regions have no allocated blocks and read as zeros. Only written regions consume physical blocks."],
    ["Core idea — Internal versus external fragmentation?", "Internal fragmentation is unused space inside an allocated unit, such as the last block of a file. External fragmentation is free space split into pieces that are hard to use as one contiguous extent."],
    ["Exam method — What should you draw for an inode or directory question?", "Draw the inode, label every pointer level and its capacity, number logical file blocks from zero, and show each directory component as a name-to-inode lookup." ]
  ],

  "L05–L07 · Crash recovery and filesystem calls": [
    ["Core idea — Why can a crash corrupt metadata even if every individual disk write is atomic?", "One logical operation updates several blocks. A crash between those writes can leave a mixture of old and new state."],
    ["Core idea — Why is write-back caching both useful and risky?", "It combines and reorders writes for speed, but acknowledged changes may still exist only in volatile memory when power fails."],
    ["Core idea — What reachability rule guides safe filesystem write ordering?", "Initialize a new object before making durable metadata point to it. Otherwise a crash can leave a reachable inode or block containing stale or invalid data."],
    ["Core idea — What allocation rule guides safe filesystem write ordering?", "Do not expose a block as free while durable metadata can still reach it, and do not make two files durably claim the same block."],
    ["Core idea — What can <code>fsck</code> do after a crash?", "It scans durable metadata, detects structural inconsistencies, and repairs or quarantines what it can. It cannot reconstruct user data that was never written."],
    ["Core idea — State the write-ahead logging rule.", "Write the transaction's redo information to the log and make its commit durable before writing the corresponding home locations."],
    ["Core idea — What does a durable commit record mean?", "Recovery must treat the logged transaction as complete and redo it if needed. A transaction without a durable commit is ignored or rolled back according to the log design."],
    ["Core idea — Why must redo operations be idempotent?", "Recovery itself can crash. Reapplying the same logged update must produce the same correct state rather than applying the change twice."],
    ["Core idea — What does a file descriptor represent?", "It is a small process-local integer naming an open kernel object. It is not the inode number and is meaningful only within that process's descriptor table."],
    ["Trace — What can <code>read(fd, buf, n)</code> return?", "A positive short count, exactly $n$, zero for EOF, or $-1$ for an error. Correct code handles all four cases."],
    ["Trace — Why must robust <code>write</code> code loop?", "A successful write may transfer fewer bytes than requested. Advance the buffer pointer by the completed count and continue until all bytes are written or a real error occurs."],
    ["Core idea — Why are <code>open</code> flags and creation mode different?", "Flags choose behavior such as read/write, append, truncate, or create. The mode supplies initial permission bits only when a new file is created, still filtered by the process umask."],
    ["Exam method — How should you solve a crash-ordering question?", "List every persistent update, identify pointers and ownership changes, then order writes so no crash prefix creates a dangling reference, double allocation, or committed transaction without its log." ]
  ],

  "L08–L11 · Processes, descriptors, and pipes": [
    ["Core idea — Program versus process?", "A program is passive code and data on disk. A process is one running instance with an address space, registers, PID, descriptors, and kernel scheduling state."],
    ["Trace — What does a successful <code>fork()</code> return?", "The parent receives the child's PID and the child receives 0. Both continue from the instruction after <code>fork</code>. Failure returns $-1$ to the original process and creates no child."],
    ["Core idea — What does copy-on-write change about <code>fork</code>?", "Parent and child initially share physical pages marked read-only. The first write to a shared page faults and creates a private copy, preserving separate logical address spaces cheaply."],
    ["Core idea — What are the three layers behind an open file descriptor?", "A process-local descriptor-table entry points to a system-wide open-file description, which contains offset/status state and points to an inode, device, or pipe endpoint."],
    ["Trace — After <code>fork</code>, do parent and child share an open file's offset?", "Yes. Their copied descriptors point to the same open-file description, so reads and writes through either process advance one shared offset."],
    ["Core idea — What does a successful <code>execvp</code> replace, and what survives?", "It replaces the process's program and address space. The PID and open descriptors survive unless a descriptor is marked close-on-exec."],
    ["Core idea — Why does a parent call <code>waitpid</code>?", "It waits for or polls a child and collects its termination status. Collection removes the child's zombie record."],
    ["Core idea — What is a pipe?", "A bounded kernel byte buffer with read and write endpoints. It carries a byte stream; it does not preserve application message boundaries."],
    ["Trace — Exactly when does a pipe read return EOF?", "When the buffer is empty and every descriptor referring to the write endpoint has been closed in every process."],
    ["Trace — Why can one forgotten write descriptor make a pipeline hang?", "The kernel still sees a possible writer, so the reader waits for more bytes instead of receiving EOF—even if the process holding that descriptor never plans to write."],
    ["Trace — What does <code>dup2(oldfd, newfd)</code> do?", "It atomically closes <code>newfd</code> if needed and makes it refer to the same open-file description as <code>oldfd</code>. If the numbers are equal, it does nothing."],
    ["Trace — How does <code>A | B</code> connect the two programs?", "Create the pipe before forking; connect A's standard output to the write end and B's standard input to the read end with <code>dup2</code>; close every redundant endpoint; then exec both programs."],
    ["Core idea — Why must a shell start every pipeline stage before waiting?", "Stages must run concurrently. Waiting too early serializes the pipeline and can deadlock when a producer fills the pipe before the consumer exists."],
    ["Trace — What should the child do when <code>exec</code> fails?", "Report the error and terminate immediately, usually with <code>_exit</code>. It must not fall back into the shell's parent control flow or flush duplicated user-space buffers."],
    ["Exam method — How should you trace descriptor code?", "After every <code>open</code>, <code>pipe</code>, <code>fork</code>, <code>dup2</code>, <code>close</code>, and <code>exec</code>, redraw each process's descriptor table and the shared kernel objects with offsets and reference counts." ]
  ],

  "L12–L16 · Threads, synchronization, and trust": [
    ["Core idea — What do threads in one process share, and what remains private?", "They share the address space, heap, globals, code, and descriptors. Each thread has its own registers, stack, and scheduling state."],
    ["Core idea — What is a data race?", "Two threads access the same memory concurrently, at least one access writes, and the accesses lack the synchronization required by the language and program."],
    ["Trace — Why is <code>count++</code> not an atomic operation?", "It normally expands into load, add, and store. Two threads can load the same old value and each store the same incremented value, losing one update."],
    ["Core idea — What is a critical section?", "A region whose accesses to shared state must appear indivisible relative to competing threads so the shared invariant cannot be observed or left half-updated."],
    ["Core idea — What should a mutex protect?", "A stated invariant over shared state, not merely a single variable. Every path that reads or changes the related fields must follow the same locking rule."],
    ["Core idea — What tradeoff does lock granularity create?", "One coarse lock is easier to reason about but limits parallelism. Finer locks allow concurrency but make ordering, atomic updates, and deadlock avoidance harder."],
    ["Core idea — What four conditions are jointly necessary for deadlock?", "Mutual exclusion, hold-and-wait, no forced preemption of held resources, and circular wait. Breaking any one prevents that deadlock pattern."],
    ["Trace — What does <code>cv.wait(lock)</code> do as one atomic sleep operation?", "It places the thread among the waiters, releases the mutex, and blocks without a lost-wakeup window. Before returning, it reacquires the mutex."],
    ["Core idea — Why must a condition-variable wait use <code>while</code> rather than <code>if</code>?", "A wakeup only means the predicate may have changed. Another thread may consume the resource first, and spurious wakeups are allowed, so the predicate must be rechecked under the lock."],
    ["Trace — What causes a lost wakeup?", "A thread checks a predicate, releases or has not yet joined the wait queue, and a notifier changes the state and signals in that gap. The waiter then sleeps despite the event already occurring."],
    ["Core idea — What is a monitor?", "Shared state plus methods that access it under one mutex, with condition variables used to wait for explicit state predicates."],
    ["Trace — What belongs in a one-lane bridge admission predicate?", "At minimum: current direction, number on the bridge, capacity, and any fairness state. Safety asks whether entering is legal now; fairness decides who gets the next chance."],
    ["Core idea — Safety versus fairness in synchronization?", "Safety means no forbidden state occurs. Fairness means an eligible participant is not postponed forever. A monitor can be safe while still starving one direction."],
    ["Core idea — What does it mean to trust an operating-system component?", "You accept dependence on its behavior because you expect it to preserve required properties. Good trust analysis names the property, evidence, affected parties, and cost of failure."],
    ["Exam method — How should you design a condition-variable solution?", "Write the invariant and wait predicate first, identify one mutex protecting every predicate field, wait in a loop, change state under the lock, and notify only after the change can make progress legal." ]
  ],

  "L17–L20 · Dispatching, scheduling, and preemption": [
    ["Core idea — What is a context switch?", "The kernel saves one thread's CPU state and restores another's so the processor continues as if it had always been running the new thread."],
    ["Trace — Which saved value actually changes the running thread's call stack?", "The stack pointer. Loading the incoming thread's saved stack makes subsequent pops and return instructions restore that thread's registers and instruction location."],
    ["Core idea — READY versus RUNNING versus BLOCKED?", "RUNNING owns a CPU. READY could run but is waiting for a CPU. BLOCKED cannot run until an event such as I/O completion, unlock, or notification occurs."],
    ["Core idea — What is the convoy effect under first-come, first-served scheduling?", "Many short jobs wait behind one long job, producing poor response time and often poor average turnaround."],
    ["Core idea — How does Round Robin's time quantum change behavior?", "A very large quantum approaches FCFS. A very small quantum improves responsiveness but spends more time switching and may damage cache locality."],
    ["Core idea — Why is shortest-remaining-processing-time attractive but difficult?", "If remaining times were known, it minimizes average completion time. Real systems do not know the future exactly, and long jobs can starve."],
    ["Exam method — Define response, turnaround, and waiting time.", "Response $=$ first run minus arrival. Turnaround $=$ completion minus arrival. Waiting $=$ turnaround minus actual service time."],
    ["Core idea — How does a timer interrupt enable preemption?", "Hardware transfers control to a privileged handler after a bounded time, letting the kernel save the current thread and run the scheduler."],
    ["Core idea — Why does disabling interrupts help protect a lock on one CPU?", "It prevents the current core from being preempted in the middle of the lock's internal bookkeeping. It does not stop another core."],
    ["Trace — Why must unlocking and waking a waiter be carefully ordered?", "The implementation must transfer ownership or mark the waiter ready without a gap where another thread steals the lock or a wakeup is lost."],
    ["Trace — Why must condition-variable waiting release the monitor lock as part of sleeping?", "If the waiter slept while retaining the lock, no notifier could acquire the lock to change the predicate. A separate release-then-sleep would create a lost-wakeup gap."],
    ["Exam method — How should you solve a scheduling problem?", "Draw a time axis, update the ready queue at every arrival/completion/quantum boundary, apply the policy exactly, then compute metrics from the finished schedule rather than intuition." ]
  ],

  "L21–L24 · Virtual memory and paging": [
    ["Core idea — What illusion does virtual memory give each process?", "A private, simple address space even though physical RAM is shared, fragmented, protected, and sometimes smaller than the total virtual memory in use."],
    ["Trace — How does base-and-bound translation work?", "If virtual address $v$ is below the bound, physical address $=base+v$; otherwise fault. The bound is a size limit, not a physical ending address."],
    ["Core idea — What does segmentation add to base-and-bound?", "Several independently placed and protected variable-size regions, such as code, heap, and stack, instead of one contiguous region."],
    ["Core idea — What does paging change?", "It divides virtual and physical memory into equal-size pages and frames, allowing each virtual page to map to any physical frame."],
    ["Trace — For page size $2^p$, how is a virtual address split?", "The low $p$ bits are the page offset and remain unchanged. The higher bits form the virtual page number used to find a physical frame."],
    ["Core idea — What information does a page-table entry need?", "A physical frame number plus status and permission bits such as present, writable, user/supervisor, referenced, dirty, and executable."],
    ["Core idea — Why use a multilevel page table?", "A flat table reserves entries for every possible virtual page. A multilevel tree allocates lower levels only for virtual regions the process actually uses."],
    ["Core idea — What does a TLB cache?", "Recent virtual-page to physical-frame translations and permission information, avoiding a full page-table walk on most accesses."],
    ["Core idea — TLB miss versus page fault?", "A TLB miss can still find a resident mapping by walking the page table. A page fault requires kernel action because the page is absent or the access violates protection."],
    ["Trace — What happens on a valid demand-page fault?", "The kernel obtains a frame, evicts a victim if necessary, loads or initializes the requested page, updates the PTE and TLB state, and retries the faulting instruction."],
    ["Core idea — Absent-but-valid page versus invalid address?", "Absent-but-valid means the virtual page belongs to the process but is not resident. Invalid means the process has no legal mapping there, so the access should fail."],
    ["Core idea — Why do some evicted pages need disk writes and others do not?", "Dirty anonymous or modified data must be preserved. Clean code or file-backed pages can often be discarded and reloaded from their original source."],
    ["Core idea — What is thrashing?", "The active working sets exceed available frames, so the system spends most of its time faulting and moving pages rather than executing useful work."],
    ["Trace — How does the Clock replacement algorithm choose a victim?", "Inspect the frame under the hand. If its reference bit is 1, clear it and advance; evict the first eligible frame found with reference bit 0, then continue the hand from there."],
    ["Exam method — How should you trace address translation?", "Write the page size and bit split, compute every page-table index, check presence and permissions before using the frame number, preserve the offset, and record any TLB or fault state changes." ]
  ],

  "L25–L27 · Multicore, flash, Meltdown, and synthesis": [
    ["Core idea — Why is disabling interrupts not a multicore mutex?", "It affects only the current core. Another core can execute concurrently and touch the same lock state."],
    ["Core idea — What hardware operation makes a multicore lock possible?", "An atomic read-modify-write operation such as exchange or compare-and-swap, together with the required memory-ordering guarantees."],
    ["Core idea — Spinning versus blocking?", "Spinning repeatedly checks while consuming a CPU and is useful only for very short waits. Blocking yields the CPU but costs scheduler and context-switch work."],
    ["Core idea — Why use per-core ready queues?", "They reduce contention and preserve cache affinity. Load balancing or work stealing is then needed when work is unevenly distributed."],
    ["Core idea — Why must flash erase before rewriting?", "Programming changes cells in only one direction. Resetting them requires erasing a larger block, so small logical updates may trigger copying and garbage collection."],
    ["Core idea — What does the flash translation layer do?", "It maps logical blocks to changing physical pages while handling out-of-place writes, garbage collection, wear leveling, and bad blocks."],
    ["Core idea — What is write amplification?", "Physical bytes written divided by logical bytes requested. Copying live flash pages during garbage collection can make the ratio much greater than one."],
    ["Trace — How did Meltdown leak protected kernel data?", "A transient load used a kernel byte to touch one cache line. The CPU later rejected the load architecturally, but timing the cache revealed which line had been touched."],
    ["Core idea — Why did squashing speculative execution not erase the leak?", "Architectural register state rolled back, but the cache state remained and could be measured as a side channel."],
    ["Core idea — How does kernel page-table isolation reduce Meltdown exposure?", "Most kernel pages are not mapped while user code runs, so transient user execution cannot address those sensitive pages."],
    ["Synthesis — What four recurring ideas connect the whole CS111 course?", "Abstraction hides implementation, virtualization creates private-looking resources, concurrency interleaves users of shared state, and layering composes mechanisms with performance and trust tradeoffs." ]
  ],

  "Midterm · Worked problem methods": [
    ["Exam method — Which disk block contains inode $i$ if the inode table starts at $s$ and each block holds $k$ inodes?", "$s+\\lfloor(i-1)/k\\rfloor$. The slot inside that block is $(i-1)\\bmod k$ because inode numbering starts at 1."],
    ["Exam method — What is the first step in a V6 large-file lookup?", "Convert the byte offset to a zero-based logical block number and in-block offset. Then subtract the capacity of each earlier pointer region before indexing the next level."],
    ["Exam method — How do you check a proposed directory rename sequence for crash safety?", "Examine every crash prefix. At each point, names must refer only to initialized inodes, link counts and allocation must remain repairable, and the old or new name should remain reachable according to the required atomicity."],
    ["Exam method — What must a correct byte-copy loop track?", "Bytes successfully read, bytes already written from that chunk, the remaining count, pointer advancement, EOF, <code>EINTR</code>, and other errors."],
    ["Exam method — How do you count processes after several <code>fork</code> calls?", "Draw a process tree and follow control flow. An unconditional successful fork doubles only the processes that reach it; branches, failures, exits, and execs can change the count."],
    ["Exam method — How do you determine possible print orders after <code>fork</code>?", "Record per-process program-order constraints, add any wait or pipe dependencies, then enumerate only interleavings that preserve those constraints."],
    ["Exam method — A pipe reader hangs. What is the first diagnostic question?", "Which processes still hold a descriptor for the write endpoint? Trace inherited and duplicated copies, not just the process intended to write."],
    ["Exam method — Why can waiting inside a pipeline-construction loop deadlock?", "The producer may fill the pipe before the consumer has been created. Start all stages and close parent copies before waiting."],
    ["Exam method — What should a descriptor table drawing include?", "One table per process; descriptor numbers; the shared open-file descriptions or pipe endpoints; offsets, flags, and reference counts; and every change after fork, dup, close, or exec."],
    ["Exam method — What five pictures solve most CS111 midterm traces?", "A process tree, per-process descriptor tables, shared kernel objects, a block/inode map, and an ordered event timeline." ]
  ],

  "Final · Worked problem methods": [
    ["Exam method — What are the five ingredients of a correct monitor solution?", "Shared state, a stated invariant, one protecting mutex, a <code>while</code>-checked wait predicate, and state-change notifications chosen from the predicate logic."],
    ["Exam method — How do you prove a condition-variable design cannot lose a wakeup?", "Show that checking the predicate and joining the wait queue/releasing the lock are atomic with respect to every notifier's state update and signal."],
    ["Exam method — How do you find a resource bound that prevents deadlock?", "Find the worst state where each participant holds resources while waiting for one more. Keep total admission low enough that at least one participant can always finish and release resources."],
    ["Exam method — How do you compare scheduling policies?", "Construct the exact schedule first, then calculate response, turnaround, and waiting time for every job. Discuss fairness and starvation separately from averages."],
    ["Exam method — Base $=4000$, bound $=1200$, virtual address $=900$: what happens?", "The address is valid because $900<1200$, and the physical address is $4000+900=4900$."],
    ["Exam method — With 4 KiB pages, split virtual address <code>0x12345</code>.", "A 4 KiB page has 12 offset bits. The offset is <code>0x345</code> and the VPN is <code>0x12</code>."],
    ["Exam method — What changes when a dirty page is evicted?", "Write its contents to backing storage before reusing the frame, mark the old PTE non-present with backing information, install the new mapping, and invalidate stale TLB entries."],
    ["Exam method — How do you trace Clock without guessing?", "Write the circular frame order, hand position, reference and dirty bits. For each choice, clear/advance or evict exactly as the algorithm says, then record the new hand position."],
    ["Exam method — What evidence distinguishes a TLB miss from a page fault in a trace?", "A TLB miss still has a present legal PTE. A page fault reaches a non-present or protection-violating PTE and enters the kernel's fault path."],
    ["Exam method — What makes a Meltdown explanation complete?", "Name the forbidden transient load, the secret-dependent microarchitectural effect, the timing measurement, why architectural rollback is insufficient, and the page-table-isolation mitigation."],
    ["Exam method — How should an ethics or trust answer be structured?", "Name the stakeholders, the property being trusted, supporting evidence and assumptions, likely failure modes, who bears the harm, and a concrete mitigation or accountability mechanism." ]
  ]
} };

CARD_DATA["CS 157"] = { units: {
  "L01–L03 · Syntax, semantics, and entailment": [
    ["Core idea — What is the difference between syntax and semantics?", "Syntax says which symbol strings are legal formulas. Semantics says what those formulas mean under an interpretation and when they are true."],
    ["Core idea — What is a propositional interpretation?", "A complete assignment of true or false to every propositional atom. The connective rules then determine every compound formula's truth value."],
    ["Core idea — When is $p\\Rightarrow q$ false?", "Only when $p$ is true and $q$ is false. In every other row the implication is true."],
    ["Translation — How should “$p$ only if $q$” be formalized?", "$p\\Rightarrow q$. The phrase after “only if” states a necessary condition."],
    ["Core idea — What does it mean for an interpretation to satisfy a set $\\Gamma$?", "It makes every formula in $\\Gamma$ true at the same time. Treat the set like a conjunction of all its members."],
    ["Core idea — Valid, satisfiable, unsatisfiable, and contingent?", "Valid means true in every interpretation. Satisfiable means true in at least one. Unsatisfiable means true in none. Contingent means true in some and false in others."],
    ["Core idea — What does $\\Gamma\\models\\varphi$ mean?", "Every interpretation satisfying all premises in $\\Gamma$ also satisfies $\\varphi$. It is a claim about all models, not about a particular proof."],
    ["Exam method — How do you disprove an entailment?", "Give one countermodel: an interpretation that makes every premise true and the conclusion false."],
    ["Core idea — Logical equivalence versus consistency?", "Equivalent formulas agree in every interpretation. Formulas are consistent when at least one interpretation satisfies them together."],
    ["Core idea — Why do inconsistent premises entail every conclusion?", "Entailment forbids a premise-true/conclusion-false interpretation. Inconsistent premises have no satisfying interpretation, so no counterexample exists."],
    ["Core idea — What is monotonicity of entailment?", "Once $\\Gamma\\models\\varphi$, adding more premises cannot destroy that entailment: every model of the larger set is still a model of $\\Gamma$."],
    ["Core idea — Object language versus metalanguage?", "The object language contains the formulas being studied. The metalanguage is the language used to discuss formulas, interpretations, truth, entailment, and proofs."],
    ["Exam method — What is the fastest classification workflow?", "Try to find one satisfying interpretation and one falsifying interpretation. Finding both proves contingency; failing to find one side tells you what full proof or truth table is still needed." ]
  ],

  "L04–L06 · Hilbert, Fitch, CNF, and resolution": [
    ["Core idea — What is an axiom schema?", "A formula pattern containing metavariables. Uniformly substituting formulas for those metavariables produces its instances."],
    ["Core idea — What is modus ponens?", "From $\\varphi$ and $\\varphi\\Rightarrow\\psi$, infer $\\psi$."],
    ["Core idea — What is the difference between $\\Gamma\\models\\varphi$ and $\\Gamma\\vdash\\varphi$?", "$\\models$ means semantic consequence across interpretations. $\\vdash$ means a derivation exists using the rules of a specified proof system."],
    ["Core idea — What does soundness guarantee?", "If the proof system derives $\\Gamma\\vdash\\varphi$, then $\\Gamma\\models\\varphi$. The rules never prove a semantically invalid consequence."],
    ["Core idea — What does completeness guarantee?", "If $\\Gamma\\models\\varphi$, then the proof system can derive $\\Gamma\\vdash\\varphi$. Every semantic consequence is reachable by a formal proof."],
    ["Fitch method — How do you prove an implication $A\\Rightarrow B$?", "Open a subproof assuming $A$, derive $B$ inside it, then discharge the assumption with implication introduction."],
    ["Fitch method — How do you prove a negation $\\neg A$?", "Assume $A$, derive a contradiction, and discharge the assumption with negation introduction."],
    ["Fitch method — How does disjunction elimination work?", "From $A\\lor B$, derive the same target $C$ once under assumption $A$ and once under assumption $B$; then conclude $C$."],
    ["Core idea — Why can a closed subproof's internal lines not be cited later?", "Those lines depended on a temporary assumption. Only the conclusion licensed by discharging that assumption is available outside."],
    ["Exam method — What is the INDO order for clausal form?", "Implications out, Negations in, Distribution of $\\lor$ over $\\land$, then Operators out so the result is a set of clauses."],
    ["Core idea — State the resolution rule.", "From $C\\lor p$ and $D\\lor\\neg p$, infer $C\\lor D$. The complementary literals disappear."],
    ["Core idea — What does the empty clause mean?", "It has no literal that could make it true, so it represents contradiction or unsatisfiability."],
    ["Exam method — How does resolution prove $\\Gamma\\models\\varphi$?", "Add $\\neg\\varphi$ to the premises, convert everything to clauses, and resolve until the empty clause is derived."],
    ["Exam method — What should a readable resolution proof record?", "Number the initial clauses and each resolvent, identify the two parent clauses and resolved literal, and end explicitly at the empty clause." ]
  ],

  "L07–L10 · Relations, quantifiers, and quantified proofs": [
    ["Core idea — What must a relational interpretation specify?", "A nonempty domain, an object for each constant, and an $n$-ary relation over the domain for each $n$-ary predicate."],
    ["Core idea — Term, atomic formula, open formula, and sentence?", "A term denotes an object. Applying a relation to terms creates an atomic formula. An open formula has a free variable; a sentence has none."],
    ["Core idea — How should you read $\\forall x\\,P(x)$?", "For every object in the domain, substituting that object for $x$ makes $P(x)$ true."],
    ["Core idea — How should you read $\\exists x\\,P(x)$?", "There is at least one domain object that makes $P(x)$ true. The object is called a witness."],
    ["Core idea — Why does quantifier order matter?", "$\\forall x\\exists y$ may choose a different $y$ for each $x$. $\\exists y\\forall x$ requires one single $y$ that works for every $x$."],
    ["Exam method — How do you refute a universal sentence?", "Name one domain element that makes its body false."],
    ["Exam method — How do you satisfy an existential sentence?", "Name one witness and verify that the formula's body is true for it."],
    ["Core idea — What is grounding over a finite named domain?", "Replace $\\forall$ with a conjunction over all named objects and $\\exists$ with a disjunction, reducing the sentence to propositional logic."],
    ["Core idea — What is the side condition for universal introduction?", "The name being generalized must be arbitrary; it cannot occur in any undischarged assumption that gives it a special property."],
    ["Core idea — What is the side condition for existential elimination?", "Introduce a fresh temporary witness and derive a conclusion that contains no free occurrence of that witness."],
    ["Common trap — Why is $\\exists xP(x),\\exists xQ(x)\\models\\exists x(P(x)\\land Q(x))$ invalid?", "The two existential claims may have different witnesses. Nothing says one object has both properties."],
    ["Core idea — Why is $\\forall x\\exists yR(x,y)$ weaker than $\\exists y\\forall xR(x,y)$?", "The first permits witness choice to depend on $x$; the second demands a shared witness independent of $x$."],
    ["Exam method — What should you write beside every fresh name in a quantified proof?", "Its role: arbitrary parameter for $\\forall I$, chosen term for $\\forall E$ or $\\exists I$, or fresh temporary witness for $\\exists E$."],
    ["Core idea — How do logic-grid puzzles become relational logic?", "Represent objects and relations explicitly, encode every clue plus uniqueness constraints, then search for or derive the satisfying interpretation." ]
  ],

  "L11–L15 · Terms, induction, equality, and structure maps": [
    ["Core idea — What does a function symbol do in term logic?", "It builds a new term from object-denoting terms. An $n$-ary function is interpreted as a total map from $D^n$ to $D$."],
    ["Core idea — Why can a Herbrand universe be infinite?", "A function can be nested forever: $a,f(a),f(f(a)),\\ldots$. Every distinct generated term is another domain element in the free term interpretation."],
    ["Core idea — Why can ordinary finite grounding fail for term logic?", "There may be infinitely many generated terms, so replacing quantifiers with a finite conjunction or disjunction no longer enumerates the domain."],
    ["Induction method — What are the obligations in linear induction?", "Prove the base term, then prove that the property for an arbitrary term implies the property for its successor."],
    ["Induction method — What are the obligations in structural induction?", "Give one base proof for every nonrecursive constructor and one inductive step for every recursive constructor, using hypotheses only for immediate subterms."],
    ["Common trap — What makes a structural-induction proof incomplete?", "Skipping a grammar constructor, failing to state the induction property, or assuming the result for the whole object instead of only its smaller components."],
    ["Core idea — What does equality allow beyond reflexivity, symmetry, and transitivity?", "Substitution or congruence: equal terms may replace one another in functions and relations."],
    ["Core idea — What is an isomorphism?", "A bijection between structures that preserves and reflects constants, functions, and relations. It is a perfect renaming, so all sentences keep the same truth value."],
    ["Core idea — What is a homomorphism?", "A map that preserves designated structure in the forward direction but may merge objects and need not reflect every relation."],
    ["Exam method — What must you check when claiming two structures are isomorphic?", "Define the map, prove it is one-to-one and onto, and verify preservation of every constant, function, and relation in the signature."],
    ["Core idea — Why is the grammar of terms also an induction recipe?", "The base constructors give the base cases and each recursive function symbol gives one inductive step."],
    ["Core idea — What does metalevel encoding let logic talk about?", "Representations of formulas, substitutions, interpretations, and proofs, so claims about the formal system itself can be stated and proved."],
    ["Exam method — What should appear at the top of an induction proof?", "The exact property $P(t)$, the generated domain or grammar, the induction principle being used, and the constructors that must be covered." ]
  ],

  "Review 1 · Propositional walkthroughs": [
    ["Worked problem — Classify $\\neg r\\land(\\neg p\\land r)\\land(r\\Rightarrow p)$.", "Unsatisfiable. It contains both $r$ and $\\neg r$, so no interpretation can satisfy the conjunction."],
    ["Worked problem — Classify $((\\neg p\\lor q)\\Rightarrow(p\\Rightarrow q))\\land q$.", "Contingent, and in fact equivalent to $q$. It is true whenever $q$ is true and false whenever the final conjunct $q$ is false."],
    ["Worked problem — Does $\\{p\\Rightarrow r\\}\\models p\\Rightarrow(q\\lor r)$?", "Yes. To falsify the conclusion, $p$ must be true and $r$ false, but that would falsify the premise."],
    ["Worked problem — Countermodel to $\\{p\\Rightarrow(q\\lor r),p\\Rightarrow r\\}\\models q\\Rightarrow r$?", "Set $p=0,q=1,r=0$. Both premises are vacuously true, while $q\\Rightarrow r$ is false."],
    ["Worked problem — If $\\Gamma\\models\\varphi$, must $\\Gamma\\cup\\Delta\\models\\varphi$?", "Yes. Every model of the larger set is still a model of $\\Gamma$, so it must satisfy $\\varphi$."],
    ["Worked problem — Why is $((p\\Rightarrow q)\\lor(q\\Rightarrow r))$ valid?", "Both implications cannot be false together: the first being false requires $q=0$, while the second being false requires $q=1$."],
    ["Fitch plan — From $p\\Leftrightarrow q$, how do you prove $\\neg p\\Leftrightarrow\\neg q$?", "Prove both directions separately. In each direction, assume one negation, temporarily assume the corresponding positive proposition, use the biconditional to derive its contradiction, and discharge."],
    ["Fitch plan — From $\\neg p\\lor\\neg q$, how do you prove $\\neg(p\\land q)$?", "Assume $p\\land q$, extract both conjuncts, and use cases on the premise. Either disjunct contradicts one extracted conjunct."],
    ["Resolution plan — What is the first move in proving an entailment?", "Negate the conclusion and add it to the premise clauses. The target is now the empty clause, not the original conclusion."],
    ["CNF walkthrough — Convert $\\neg(g\\land(r\\Rightarrow f))$.", "It becomes $(\\neg g\\lor r)\\land(\\neg g\\lor\\neg f)$, so the clauses are $\\{\\neg g,r\\}$ and $\\{\\neg g,\\neg f\\}$." ]
  ],

  "Review 2 · Relational walkthroughs": [
    ["Worked model — Domain $\\{a,b\\}$ has $P(a)$ true and $P(b)$ false. Is $\\forall xP(x)$ true?", "No. Universal truth requires both objects, and $b$ is a counterexample."],
    ["Worked model — Why can $\\forall x\\exists yR(x,y)$ hold while $\\exists y\\forall xR(x,y)$ fails?", "Each row may contain some true cell while no single column is entirely true. The first permits different witnesses; the second requires one shared column."],
    ["Classification — Is $(\\exists x\\forall yP(x,y))\\Rightarrow(\\forall y\\exists xP(x,y))$ valid?", "Yes. Reuse the one $x$ that works for every $y$ as the witness required for each individual $y$."],
    ["Classification — Is the reverse implication valid?", "No. Different $y$ values may need different $x$ witnesses, so no one $x$ need work for all $y$."],
    ["Quantified contraposition — What follows from $\\forall x(P(x)\\Rightarrow Q(x))$ and $\\neg Q(a)$?", "$\\neg P(a)$. Instantiate the universal at $a$ and apply contraposition."],
    ["Fitch walkthrough — From $\\exists x(P(x)\\land Q(x))$, prove $\\exists xP(x)$.", "Open $\\exists E$ with fresh witness $c$, extract $P(c)$, introduce $\\exists xP(x)$ using $c$, then discharge the witness subproof."],
    ["Fitch walkthrough — Why can inconsistent quantified premises prove an unrelated $\\forall xQ(x)$?", "Choose arbitrary $c$, derive a contradiction from the premises at $c$, infer $Q(c)$ by explosion, then generalize because $c$ was arbitrary."],
    ["Translation — “Exactly one person likes everyone.”", "$\\exists x(\\forall yL(x,y)\\land\\forall z((\\forall yL(z,y))\\Rightarrow z=x))$. The first part gives existence; the second gives uniqueness."],
    ["Common trap — What invalidates using one name as both an existential witness and an arbitrary universal parameter?", "A witness has a special property from the existential premise, so it is not arbitrary. Use separate fresh names for the two jobs."],
    ["Grounding — Over domain names $a,b$, expand $\\exists x(P(x)\\land\\forall yR(x,y))$.", "$[P(a)\\land R(a,a)\\land R(a,b)]\\lor[P(b)\\land R(b,a)\\land R(b,b)]$." ]
  ],

  "Review 3 · Terms and induction walkthroughs": [
    ["Term check — With unary function $f$ and relation $P$, is $f(f(x))$ a term or formula?", "A term. Functions consume terms and return terms; a relation such as $P(f(f(x)))$ would create a formula."],
    ["Induction walkthrough — From $P(a)$ and $\\forall x(P(x)\\Rightarrow P(s(s(x))))$, why is one base case insufficient?", "The rule advances by two successors, creating even and odd chains. You also need $P(s(a))$ or another fact connecting the second chain."],
    ["Induction walkthrough — What strengthened property handles the two-step successor rule?", "$R(x)=P(x)\\land P(s(x))$. From two consecutive facts, the rule produces the next pair, allowing ordinary one-step induction."],
    ["Structural induction — What are the cases when terms use constant $a$ and binary function $h$?", "Base case $a$, and constructor case $h(x,y)$ with separate induction hypotheses for both immediate subterms."],
    ["Worked proof — From $P(a)$ and $\\forall x\\forall y((P(x)\\lor P(y))\\Rightarrow P(h(x,y)))$, how do you prove $\\forall xP(x)$?", "Use structural induction. The base is the premise. In the constructor case, either induction hypothesis gives the needed disjunction, so the second premise yields $P(h(x,y))$."],
    ["Linear induction — Premises alternate $P(x)\\Rightarrow Q(f(x))$ and $Q(x)\\Rightarrow P(f(x))$. What property should be proved?", "$P(x)\\lor Q(x)$. Each side of the disjunction produces the opposite property at the successor term $f(x)$."],
    ["Equality walkthrough — From $a=b$ and $b=c$, how do you obtain $f(a)=f(c)$?", "Use transitivity to derive $a=c$, then function congruence to replace equal arguments inside $f$."],
    ["Core idea — Why do isomorphic structures satisfy the same sentences?", "The bijection preserves and reflects every symbol's interpretation, so variable assignments and formula truth transfer in both directions."],
    ["Exam method — How do you choose between linear, tree, and structural induction?", "Match the term grammar: one successor gives linear induction, several recursive children give tree induction, and a general grammar gives one case per constructor."],
    ["Exam method — What is the final check after completing constructor cases?", "Explicitly invoke the correct induction principle and state the universally quantified conclusion. A collection of local cases is not yet the final theorem." ]
  ]
} };

CARD_DATA["CS 251"] = { units: {
  "L01–L03 · Blockchain and Bitcoin foundations": [
    ["Core idea — When is a blockchain more useful than an ordinary database?", "When parties need one shared history but do not trust a single acceptable operator. If everyone accepts one administrator, a conventional replicated database is usually simpler and faster."],
    ["Core idea — What does collision resistance contribute to a commitment?", "It makes it infeasible to open one hash as two different messages. A plain hash may still fail to hide a predictable message, so binding and hiding are separate properties."],
    ["Core idea — What does a Merkle root commit to?", "An ordered collection of leaves. Changing a leaf or its position changes hashes on the path to the root."],
    ["Trace — What does a Merkle inclusion proof contain?", "The leaf, one sibling hash per tree level, and each sibling's left/right position. Verification recomputes upward to the trusted root in $O(\\log N)$ hashes."],
    ["Common trap — What does a valid Merkle proof not establish?", "It does not prove that the root is authentic, current, or finalized. Another mechanism—usually consensus—must establish which root to trust."],
    ["Core idea — What is a Bitcoin UTXO?", "An unspent transaction output: a value and locking condition that a later transaction may reference and satisfy exactly once."],
    ["Trace — How is a Bitcoin transaction fee calculated?", "Add the values of all consumed UTXOs and subtract the values of all newly created outputs. The difference is the fee."],
    ["Core idea — What two checks make a Bitcoin input valid?", "The referenced output is currently unspent, and the input's witness satisfies that output's locking script."],
    ["Core idea — What problem did SegWit solve for chains of pre-signed transactions?", "Signature malleability could change a transaction ID without changing its payment. SegWit removes witness data from the legacy transaction ID, making child references stable."],
    ["Core idea — Why is a 2-of-3 escrow useful?", "Buyer and seller can settle without help. During a dispute, the arbitrator can side with either party but cannot move the funds alone."],
    ["Trace — What makes a cross-chain atomic swap succeed or safely refund?", "Both chains lock funds to the same secret hash and use staggered timelocks. Redeeming one side reveals the secret for the other; if nobody redeems, each side eventually refunds."],
    ["Core idea — What does a watch-only HD wallet key reveal?", "It can derive addresses and monitor balances without authorizing ordinary spends. Its theft harms privacy but should not reveal the spending secret under the scheme's assumptions."],
    ["Exam method — How should you analyze a Bitcoin transaction?", "List every input UTXO, its locking rule and witness, every output and value, the fee, and any timelock or signature-hash mode. Then check conservation and double-spend status." ]
  ],

  "L04–L06 · Byzantine and permissionless consensus": [
    ["Core idea — What are the three Byzantine-broadcast properties?", "Agreement: honest parties output the same value. Validity: if the sender is honest, that value is its input. Termination: every honest party eventually outputs."],
    ["Core idea — Safety versus liveness?", "Safety says bad things never happen, such as two honest parties finalizing conflicting histories. Liveness says good things eventually happen, such as valid transactions being included."],
    ["Core idea — Synchronous versus asynchronous network?", "A synchronous model has a known delivery bound. An asynchronous model has no known bound, so silence cannot reveal whether a party failed or a message is merely delayed."],
    ["Core idea — State-machine-replication safety in one sentence.", "The logs shown to honest clients are prefix-comparable: one may be longer, but they never disagree at the same position."],
    ["Core idea — What is a Sybil attack?", "One adversary creates many identities. Permissionless consensus therefore weights a scarce resource such as work or stake rather than counting public keys."],
    ["Core idea — Why can faster proof-of-work blocks reduce security?", "If blocks arrive near the network propagation time, honest miners often build competing forks, splitting honest work and making adversarial reorganization easier."],
    ["Core idea — What does $k$-deep confirmation mean?", "A transaction's block has $k$ successors on the chosen chain. Reorganization becomes less likely with depth, but proof-of-work finality remains probabilistic."],
    ["Common trap — Why does the most-blocks chain not necessarily win?", "Nakamoto consensus chooses the valid chain with greatest cumulative proof of work. Many low-difficulty blocks can represent less work than fewer difficult blocks."],
    ["Core idea — What is proof-of-stake finality?", "A block backed by a sufficiently large validator certificate is treated as irreversible while Byzantine stake remains below the protocol's threshold."],
    ["Trace — Why do two conflicting $2/3$ certificates expose at least $1/3$ equivocation?", "Two sets of size $2n/3$ inside $n$ validators overlap in at least $n/3$. Every validator in that overlap signed both conflicts."],
    ["Core idea — What is accountable safety?", "If safety fails, publicly verifiable protocol evidence identifies a minimum amount of stake that violated the signing rules."],
    ["Core idea — Why is one stake-partitioned leader draw better than independent lotteries?", "A single draw selects exactly one leader with probability proportional to stake. Independent draws can select nobody or several leaders in the same slot."],
    ["Core idea — Why combine an available chain with finalized checkpoints?", "The available chain can keep growing with changing participation; the checkpoint layer gives slower irreversible history. The design makes their different guarantees explicit."],
    ["Exam method — How do you solve a quorum-intersection problem?", "For two quorums of size $q$ among $n$ validators, minimum overlap is $2q-n$. Require that overlap to exceed the maximum Byzantine weight that could sign both." ]
  ],

  "L07–L08 · Ethereum, the EVM, and Solidity": [
    ["Core idea — EOA versus contract account?", "An externally owned account is controlled by a signing key. A contract account contains bytecode and persistent storage and runs only when a transaction or contract call invokes it."],
    ["Core idea — What state transition does an Ethereum transaction request?", "It supplies sender authorization, destination, value, calldata, nonce, gas parameters, and chain context; EVM execution deterministically transforms the world state or reverts."],
    ["Core idea — Why does EVM execution charge gas?", "Gas prices scarce computation, storage, and bandwidth while forcing every execution path to stop when its prepaid budget ends."],
    ["Trace — What is the EIP-1559 effective gas price?", "$\\min(maxFeePerGas,\\ baseFee+maxPriorityFeePerGas)$. The base fee is burned and the priority portion rewards the proposer."],
    ["Core idea — Why not make the block gas limit enormous?", "Validators still must receive, execute, and store blocks quickly enough. Excessive work and state growth raise hardware requirements and harm liveness and decentralization."],
    ["Core idea — Storage versus memory versus calldata?", "Storage persists across transactions and is expensive. Memory lasts for one call. Calldata is immutable external input and is often cheapest to read."],
    ["Core idea — Why can a Solidity mapping not enumerate its keys automatically?", "The EVM computes a storage location directly from each key and slot; it does not maintain a key list unless the contract stores one separately."],
    ["Core idea — What is reentrancy?", "A contract makes an external call before completing its own state update, and the callee calls back into the unfinished operation using stale state."],
    ["Exam method — What is checks-effects-interactions?", "Validate conditions, update all internal state, then make external calls. A reentrancy guard may add defense, but the invariant-preserving order remains the key idea."],
    ["Common trap — Why can <code>address(this).balance</code> disagree with internal accounting?", "Ether can arrive without executing the intended deposit function, including forced or pre-sent Ether. Raw balance is not automatically the same as recorded liabilities."],
    ["Common trap — Why is a Solidity <code>private</code> variable not secret?", "The keyword restricts Solidity-level access, not blockchain visibility. Off-chain observers can inspect storage and transaction data."],
    ["Common trap — Why is a recent block hash weak lottery randomness?", "A proposer may influence whether a candidate block is published, and the current block hash is unavailable during execution. Valuable lotteries need stronger future randomness or commit–reveal."],
    ["Exam method — What is the first step in a smart-contract audit question?", "Write the intended invariant, then trace caller identity, storage reads/writes, token or Ether flow, external calls, callbacks, and revert behavior line by line."],
    ["Exam method — What makes a proposed contract fix complete?", "It blocks the demonstrated trace, preserves the intended invariant on every path, handles reverts and callbacks, and states any new trust or usability cost." ]
  ],

  "L09–L12 · DeFi, MEV, and regulation": [
    ["Core idea — Custodial versus on-chain-collateralized stablecoin?", "A custodial coin trusts an issuer and off-chain reserves/redemption. An on-chain design exposes collateral but still depends on price oracles, liquidation, contract correctness, and collateral quality."],
    ["Core idea — What is loan-to-value?", "Debt value divided by collateral value. A larger ratio means less protection against collateral-price decline."],
    ["Core idea — When is a collateralized position liquidatable?", "When its protocol-defined health factor falls below the allowed threshold, so adjusted collateral no longer safely covers the debt."],
    ["Core idea — Why can a flash loan require no upfront collateral?", "Borrowing, all intermediate actions, and repayment occur in one atomic transaction. If principal plus fee is missing at the end, every step reverts."],
    ["Common trap — Why is a flash loan usually an amplifier rather than the root bug?", "It supplies temporary capital. The exploitable weakness is usually a manipulable price, shallow market, instant governance, or unsafe accounting assumption."],
    ["Core idea — What invariant defines a constant-product AMM?", "$x\\cdot y=k$ before fees are added to reserves. A trade moves the pool along the invariant curve, producing price impact."],
    ["Trace — What is the constant-product output for input $\\Delta x$ and fee multiplier $\\phi$?", "$\\Delta y=\\dfrac{y\\phi\\Delta x}{x+\\phi\\Delta x}$. Start from the final reserve $x+\\phi\\Delta x$ rather than memorizing blindly."],
    ["Core idea — Why does a larger AMM trade have worse execution price?", "The trade changes the reserve ratio while it executes. Each additional unit moves farther along the curve, creating slippage."],
    ["Core idea — What is impermanent loss?", "The LP position's value after arbitrage relative to simply holding the deposited assets. Fees may offset it, and it becomes realized when liquidity is withdrawn."],
    ["Core idea — What is MEV?", "Value gained by controlling transaction inclusion, exclusion, or ordering within blocks."],
    ["Trace — How does a sandwich attack work?", "The attacker trades before a visible victim to move price, lets the victim execute at a worse price within its slippage limit, then reverses the first trade after the victim."],
    ["Core idea — What does proposer-builder separation change?", "Builders assemble value-maximizing blocks and proposers choose blinded bids. This reduces direct copying by proposers but does not remove ordering value or censorship risk."],
    ["Core idea — What can an encrypted mempool reduce?", "Content-based front-running before order is fixed. It does not by itself guarantee inclusion, honest decryption timing, or freedom from collusion."],
    ["Core idea — What does control-based decentralization analysis ask?", "Who can upgrade, operate, censor, manage treasury assets, or make ongoing promises? The word “decentralized” alone does not answer legal or practical control questions."],
    ["Exam method — How should you trace a DeFi attack?", "Write every balance and invariant before the transaction, trace each call and oracle read, exploit atomic composition explicitly, and recompute all balances and debt after the transaction." ]
  ],

  "L13–L15 · Parallel chains, privacy, and private transfers": [
    ["Core idea — How does Solana identify transactions that can run in parallel?", "Transactions declare the accounts they will read and write. Transactions with no conflicting writable accounts may execute concurrently."],
    ["Core idea — How does Aptos Block-STM obtain parallelism?", "It executes transactions optimistically, detects conflicts against the required order, and re-executes work whose speculative reads became invalid."],
    ["Core idea — Why are Move resources helpful for digital assets?", "A resource type can forbid ordinary copying or dropping, so code cannot accidentally duplicate or silently discard an asset."],
    ["Core idea — Pseudonymity versus unlinkability?", "Pseudonymity hides a real name behind an address that may still accumulate a recognizable history. Unlinkability makes it difficult to tell whether separate actions belong together."],
    ["Core idea — What is Bitcoin's common-input ownership heuristic?", "Inputs spent together are likely controlled by one entity because one transaction must satisfy all their locks. CoinJoin deliberately creates exceptions."],
    ["Core idea — What does CoinJoin hide, and what can still leak?", "It weakens input-output linkage by combining users, especially at equal denominations. Change, timing, later consolidation, and network metadata may still reveal links."],
    ["Core idea — What do Confidential Transactions hide?", "Amounts, using homomorphic commitments and range proofs. The transaction graph and participant addresses may remain visible."],
    ["Core idea — Why are range proofs essential for confidential outputs?", "Balance commitments alone permit modular or negative hidden values. A range proof ensures every output represents a legal nonnegative amount."],
    ["Core idea — What does a shielded Zcash-style transfer try to hide?", "The sender, recipient, and amount, while proving authorization, balance conservation, and no double spend."],
    ["Core idea — What is completeness for a proof system?", "An honest prover with a valid witness can convince the verifier of a true statement."],
    ["Core idea — What is knowledge soundness?", "A prover that convinces the verifier can be treated as knowing a valid witness, except with the scheme's stated small error."],
    ["Core idea — What is zero knowledge?", "The proof reveals nothing about the witness beyond what the public statement itself implies."],
    ["Core idea — How does a nullifier stop private double spending?", "Spending reveals a unique value derived from the secret note. The contract rejects a nullifier already seen without learning which public commitment it came from."],
    ["Common trap — Why does adding a zk-SNARK not automatically make a rollup private?", "The system may still publish transaction data and expose participants or amounts. Zero knowledge hides only what the proof statement and protocol keep outside public inputs." ]
  ],

  "L16 · How SNARKs are assembled": [
    ["Core idea — What problem does a succinct argument solve?", "A verifier checks a large computation using a proof and verification work much smaller than repeating the computation."],
    ["Core idea — How does a Merkle commitment make a PCP-style proof succinct?", "The prover commits to the long proof with one root and opens only the few positions the verifier queries, each with a logarithmic authentication path."],
    ["Core idea — What does Fiat–Shamir do?", "It replaces public random verifier challenges with hashes of the statement and transcript, making a suitable public-coin protocol noninteractive in the random-oracle model."],
    ["Core idea — What is a polynomial commitment scheme?", "A short binding commitment to a bounded-degree polynomial, with short proofs that it evaluates to a claimed value at a chosen point."],
    ["Core idea — What does combining a polynomial IOP with a PCS accomplish?", "The verifier's oracle polynomials become commitments, and oracle queries become opening proofs, producing a succinct cryptographic argument."],
    ["Core idea — What three kinds of constraints does PLONK enforce?", "Correct public inputs, valid gate equations at each row, and consistency of copied wire values under the permutation relation."],
    ["Core idea — What is a vanishing polynomial for domain $\\Omega$?", "$Z_\\Omega(X)=\\prod_{a\\in\\Omega}(X-a)$. A polynomial vanishes on every domain point exactly when it is divisible by $Z_\\Omega$."],
    ["Core idea — Why does checking a polynomial identity at a random field point work?", "If two degree-$d$ polynomials differ, Schwartz–Zippel bounds accidental agreement at a random point by at most $d/|\\mathbb F|$."],
    ["Proof gadget — How do you constrain every value of $h$ on $\\Omega$ to be Boolean?", "Zero-check $h(X)(h(X)-1)$ on $\\Omega$. The product vanishes exactly when each value is 0 or 1."],
    ["Proof gadget — How do you constrain every value of $h$ to $\\{0,\\ldots,7\\}$?", "Zero-check $\\prod_{j=0}^{7}(h(X)-j)$ on the evaluation domain."],
    ["Core idea — What is toxic waste in a trusted setup?", "Secret setup randomness that could enable forged proofs if retained. An updatable ceremony is safe if at least one honest contributor destroys its secret."],
    ["Core idea — Why must a proof-system answer track polynomial degree?", "Degree controls which PCS supports the polynomial and appears directly in random-evaluation soundness bounds."],
    ["Exam method — What is the standard ZeroCheck recipe?", "Build a polynomial that equals zero exactly for valid values, bound its degree, prove or commit to it, and invoke the zero test over the required domain."],
    ["Exam method — How should you explain a SNARK pipeline?", "Name the computation encoding, polynomial constraints, interactive/oracle checks, commitment/opening layer, Fiat–Shamir step, and the assumption behind succinct verification." ]
  ],

  "L17–L19 · Channels, rollups, bridges, and final topics": [
    ["Core idea — How does a payment channel scale payments?", "Participants lock funds once on-chain, exchange newer signed states off-chain, and use the chain only to open, cooperatively close, or resolve a dispute."],
    ["Core idea — Why must a Lightning user or watchtower monitor the chain?", "A counterparty may publish an obsolete state. The honest party must reveal the revocation remedy before the delay expires."],
    ["Core idea — How are multi-hop Lightning payments atomic?", "Every hop uses the same hash preimage with decreasing timelocks. Revealing the secret completes the route; otherwise all hops eventually refund."],
    ["Core idea — Why can a rollup process more transactions than L1?", "It batches many state transitions and asks L1 to store compressed data and verify one proof or dispute instead of executing every L2 transaction directly."],
    ["Core idea — Optimistic versus validity rollup?", "An optimistic rollup accepts a result provisionally and allows fault proofs. A validity rollup requires a validity proof before L1 accepts the new state root."],
    ["Core idea — What three rollup properties must be analyzed separately?", "Execution validity, data availability for reconstructing state, and censorship resistance or an escape path for user transactions and exits."],
    ["Core idea — Rollup versus validium?", "Both may use validity proofs. A rollup publishes necessary state data to L1; a validium relies on an external data-availability system."],
    ["Common trap — Can a validity proof compensate for withheld data?", "No. It can prove a hidden transition correct while users still lack the data needed to reconstruct balances or exit."],
    ["Core idea — What invariant must a lock-and-mint bridge preserve?", "Destination wrapped supply must not exceed source assets that are securely locked and sufficiently finalized."],
    ["Trace — Why must a bridge wait for source finality?", "If it mints before finality, a source reorganization can erase the lock while the wrapped asset remains spendable on the destination."],
    ["Core idea — Externally verified versus on-chain verified bridge?", "An external guardian set attests to source events. An on-chain verifier checks source consensus or proofs, avoiding a separate signer majority but importing more verification complexity."],
    ["Core idea — How can a flash loan attack DAO governance?", "If voting power is measured and exercised immediately, an attacker can borrow tokens, pass and execute a proposal, extract value, and repay in one transaction."],
    ["Core idea — What does account abstraction add to a wallet?", "Programmable validation and fee policy: multisig, passkeys, recovery, session keys, batching, spending limits, and sponsored gas."],
    ["Core idea — Why is post-quantum migration difficult for a blockchain?", "New signature types must coexist with old addresses and consensus rules, signatures are often larger, public keys may already be exposed, and dormant users may never migrate."],
    ["Exam method — How should you analyze a bridge?", "Trace source lock, finality, message authentication, destination mint, replay protection, burn, and release; then identify who can forge, censor, reorganize, or upgrade each step." ]
  ],

  "Practice finals · Calculations and protocol traces": [
    ["Exam method — For two quorums of size $q$ among $n$ validators, what is their minimum overlap?", "$2q-n$. Compare this overlap with the maximum Byzantine weight that could sign both conflicting values."],
    ["Worked calculation — If safety must tolerate $f<2n/5$, what finality quorum is sufficient?", "Require $2q-n>2n/5$, so $q>7n/10$. The smallest integer threshold is $\\lfloor7n/10\\rfloor+1$."],
    ["Worked calculation — A pool has invariant $k$ and target price $p=y/x$. What reserves match that price?", "$x=\\sqrt{k/p}$ and $y=\\sqrt{kp}$. Derive this from $xy=k$ and $y=px$."],
    ["Exam method — How do you calculate impermanent loss in a concrete problem?", "Use arbitrage to find final AMM reserves, value the LP share at the external price, value the original assets if simply held, then subtract or divide as requested."],
    ["Exam method — Is splitting one no-fee AMM trade into two consecutive pieces beneficial?", "No, if nothing else trades between them. Both paths end at the same final reserves on the same invariant and therefore return the same total output."],
    ["Trace — What limits a sandwich attacker's front-run size?", "The victim's minimum-output or slippage condition, plus fees and capital costs. The attacker pushes only until the victim would otherwise revert."],
    ["Exam method — How do you analyze a stablecoin reserve loss?", "State the issuer's behavior first—recapitalization, redemption, suspension, or no intervention—then divide realizable reserves by outstanding redeemable supply."],
    ["Exam method — How do you analyze a foreign-currency reserve?", "Convert every reserve to the liability currency at the stated exchange rate, sum the converted value, and divide by token supply while stating whether FX risk is hedged."],
    ["Trace — How does a repeated allowance bug work?", "The contract checks that allowance is large enough but never decreases it, so the spender reuses the same approval for multiple transfers."],
    ["Trace — How can a callback turn a bounded mint loop into over-minting?", "Each callback reenters before the outer loop completes. Nested calls pass a supply check based on incomplete state, then suspended loops resume and mint their remaining items."],
    ["Trace — Why can XOR-packed token-pair keys collide by swapping assets?", "XOR is commutative: $a\\oplus b=b\\oplus a$. A typed ordered pair must use a nested mapping or domain-separated encoding instead."],
    ["Exam method — How do you audit a create/destroy/recreate address claim?", "Write the exact address derivation, identify which creation inputs are fixed, then ask whether initialization can read mutable state and return different runtime code after recreation."],
    ["Exam method — How do you solve a page of mixed short-answer protocol questions?", "For each claim, name the exact guarantee, the party providing it, and one thing it does not guarantee. Avoid answering a stronger nearby question." ]
  ],

  "Practice finals · Privacy, proofs, and attack repair": [
    ["Attack pattern — Why do variable mixer denominations reduce anonymity?", "The exact amount becomes a fingerprint linking a later withdrawal to a deposit, even if addresses are hidden."],
    ["Attack pattern — What happens if every mixer user except one reveals their link?", "The remaining deposit and withdrawal match by elimination, collapsing that user's anonymity set."],
    ["Attack pattern — How can an exchange undercount duplicate customer liabilities in a naive Merkle proof?", "It can give two customers the same unlabeled balance leaf and path while including that liability only once."],
    ["Repair — How should proof-of-solvency leaves prevent duplicate-liability reuse?", "Bind each leaf to a unique customer identifier or index and balance, prove uniqueness in the aggregate computation, and let customers verify inclusion."],
    ["Attack pattern — Why must proof-of-solvency balances be range checked?", "A colluding customer could use a field element representing a negative amount to cancel honest liabilities modulo the field."],
    ["Core idea — Why may a validity rollup omit raw signatures from L1 data?", "The validity proof can prove signature verification using signatures as witness. Data still needed to reconstruct state and exit must remain available."],
    ["Core idea — Why does an optimistic rollup usually need signatures in available data?", "A challenger must authenticate and re-execute a disputed transaction because no validity proof has already established its authorization."],
    ["Attack pattern — How can one zk-rollup produce two different valid roots on two chains?", "It chooses two different valid transaction batches from the same prior state and proves each separately. Local validity does not enforce cross-chain uniqueness."],
    ["Repair — How can two settlement chains enforce one rollup history?", "Choose a canonical batch/root sequence and require the other chain to verify that the identical root finalized there, for example with a light-client proof."],
    ["Attack pattern — Why can an oracle be mathematically correct but economically unsafe?", "Its source market may be shallow, delayed, manipulable inside one transaction, or mismatched to liquidation timing."],
    ["Answer template — What five parts make a security answer complete?", "State the invariant, define the adversary, give a concrete trace, identify the first violated assumption, and propose a repair with its new cost or trust assumption."],
    ["Answer template — How should you compare privacy systems?", "Name the observer, then separately evaluate sender, recipient, amount, graph linkage, timing, network identity, and what trusted parties still learn."],
    ["Answer template — How should you evaluate a rollup?", "Analyze execution correctness, data availability, censorship resistance, forced inclusion or exit, upgrade authority, and settlement-chain finality separately."],
    ["Answer template — What should you do when an exam problem omits a behavioral detail?", "State a reasonable assumption explicitly, solve under it, and briefly say how the answer changes under the main alternative."],
    ["Synthesis — Why do a valid signature and Merkle proof still not prove finality?", "They prove authorization and membership under one root. Consensus must still establish that the root belongs to the canonical finalized history." ]
  ]
} };
