# Branch 3: Cybersecurity Operations & Defense (cyber.md)

## 📍 Milestone 3.4: 100% Virtual Enterprise Homelab (The Defense Matrix)
*Objective: Build, configure, and manage a zero-cost, fully virtualized enterprise-grade security operations center (SOC) to practice perimeter defense, signature analysis, and active threat hunting.*



### Sub-Node 1: Virtual Infrastructure & Network Segmentation
*Focus: Applying CCNA VLAN and routing concepts entirely within a desktop hypervisor.*
- [ ] Deploy a Type-2 Hypervisor (VirtualBox, VMware Workstation Pro, or EVE-NG) on your primary workstation.
- [ ] Configure Virtual Network Adapters (Host-Only and NAT) to create three strictly isolated virtual zones: WAN (simulated external), LAN (internal), and DMZ.
- [ ] Deploy a baseline RHEL server VM into the virtual DMZ, applying the firewalld, SELinux, and OpenSSH hardening policies from the RHEL System Security project.
- [ ] Map out the virtual IP schema (e.g., 10.0.10.0/24 for LAN, 192.168.50.0/24 for DMZ) mirroring a real enterprise environment.

### Sub-Node 2: Perimeter Defense & Next-Gen Firewall (NGFW)
*Focus: Installing and configuring the virtual network gateway and access control.*
- [ ] Deploy an open-source enterprise firewall (pfSense or OPNsense) as a VM, assigning virtual NICs to the WAN, LAN, and DMZ networks.
- [ ] Implement strict Egress and Ingress Access Control Lists (ACLs) within the virtual firewall to restrict traffic flows between the isolated VMs.
- [ ] Set up a site-to-site IPsec VPN or WireGuard tunnel interface within the virtual firewall to practice secure tunnel configurations.
- [ ] Configure pfBlockerNG (or equivalent) on the firewall VM to act as a DNS sinkhole, blocking known malicious IP feeds.

### Sub-Node 3: Intrusion Detection/Prevention (IDS/IPS) & Signatures
*Focus: Inspecting virtual packet payloads and writing custom detection logic.*
- [ ] Install Suricata or Snort on the pfSense VM to monitor the virtual LAN and DMZ interfaces.
- [ ] Enable and tune standard ET (Emerging Threats) Open rulesets, prioritizing high-severity web exploit signatures.
- [ ] Write a custom IDS signature to detect specific malicious behavior (e.g., detecting plaintext FTP logins to the RHEL VM).
- [ ] Switch the IDS from "Detection Only" to "Prevention" (IPS mode) and test the dropping of malicious packets from the WAN to the DMZ.

### Sub-Node 4: SIEM Integration & Log Aggregation
*Focus: Centralizing visibility to capture the evidence (CTE) during a cyber drill.*
- [ ] Deploy a centralized SIEM and XDR platform (e.g., Wazuh or Splunk Free) as a dedicated VM in the LAN zone.
- [ ] Configure Syslog forwarding from the pfSense virtual firewall to the SIEM VM.
- [ ] Install Wazuh agents on the RHEL DMZ server and any endpoint testing VMs.
- [ ] Create a custom alert threshold that triggers a high-priority notification when multiple failed SSH logins occur on the RHEL server within a 60-second window.

### Sub-Node 5: Attack Simulation & Automated Response (Red vs. Blue)
*Focus: Validating the defenses and leveraging Python for NetDevOps automation.*
- [ ] Spin up a Kali Linux VM on the "WAN" side of the virtual network.
- [ ] Execute a targeted vulnerability scan and simulated exploit against the hardened RHEL server in the DMZ.
- [ ] Verify that the virtual firewall, IDS/IPS, and SIEM successfully detected, blocked, and logged the attack chain.
- [ ] Write a Python script using the Wazuh API that automatically bans an attacker's IP address if the SIEM detects a confirmed SQL injection payload.

---

## 📍 Milestone 3.5: NEXT... Physical Edge Gateway Integration (The Hardware Jump)
*Objective: Transition the purely virtual lab into a hybrid environment by introducing a single physical enterprise router, bridging physical layer routing with virtualized security.*



### Sub-Node 1: Physical-to-Virtual Bridging
*Focus: Integrating physical routing hardware with a virtualized network.*
- [ ] Procure a budget-friendly physical enterprise router (e.g., a refurbished Cisco ISR series or MikroTik RouterBOARD).
- [ ] Configure the physical router as the primary gateway, connecting it directly to your ISP modem/home router.
- [ ] Set up a "Router-on-a-Stick" (802.1Q trunking) configuration on the physical router to route multiple VLANs over a single physical cable connected to your PC's Network Interface Card (NIC).
- [ ] Bridge your PC's physical NIC to the Type-2 hypervisor's virtual network switches, allowing the physical router to act as the default gateway for your virtual pfSense, RHEL, and Wazuh VMs.

### Sub-Node 2: Advanced Routing & Hardware ACLs
*Focus: Applying ENSA concepts directly to hardware.*
- [ ] Configure OSPFv2 on the physical router to dynamically exchange routes with the virtual pfSense firewall.
- [ ] Offload perimeter security by writing hardware-level Extended ACLs on the physical router to drop high-volume malicious traffic before it ever reaches your PC's CPU.
- [ ] Use Python and Netmiko to write a script that securely SSHs into the physical router, backs up its running configuration to your virtual SIEM, and verifies its routing table status daily.