// data.js - Represents the exact structure derived from Conception.md

const roadmapData = {
    id: "root",
    label: "Graduation 2027",
    category: "root",
    icon: "ri-flag-line",
    meta: "The ultimate milestone. Consolidates Networking, Telecommunications, and Cybersecurity expertise into market readiness.",
    children: [
        {
            id: "branch-network",
            label: "Networking & Infrastructure",
            category: "network",
            icon: "ri-router-line",
            meta: "Master the flow of data across enterprise and ISP-level architectures, transitioning from CLI manual configuration to NetDevOps automation.",
            children: [
                {
                    id: "net-ccna-itn",
                    label: "ITN v7.0",
                    type: "certification",
                    category: "network",
                    icon: "ri-mac-line",
                    meta: "Introduction to Networks. The fundamental skeleton of the networking career.",
                    externalLink: { label: "View Cisco Badge", url: "#" },
                    modules: [
                        { id: "itn-1", name: "Networking Today", completed: false },
                        { id: "itn-2", name: "Basic Switch and End Device Configuration", completed: false },
                        { id: "itn-3", name: "Protocols and Models (OSI & TCP/IP)", completed: false },
                        { id: "itn-4", name: "Physical Layer", completed: false },
                        { id: "itn-5", name: "Number Systems (Binary/Hex)", completed: false },
                        { id: "itn-6", name: "Data Link Layer", completed: false },
                        { id: "itn-7", name: "Ethernet Switching", completed: false },
                        { id: "itn-8", name: "Network Layer", completed: false },
                        { id: "itn-9", name: "Address Resolution (ARP/ND)", completed: false },
                        { id: "itn-10", name: "Basic Router Configuration", completed: false },
                        { id: "itn-11", name: "IPv4 Addressing (Subnetting/VLSM)", completed: false },
                        { id: "itn-12", name: "IPv6 Addressing", completed: false },
                        { id: "itn-13", name: "ICMP", completed: false },
                        { id: "itn-14", name: "Transport Layer (TCP/UDP)", completed: false },
                        { id: "itn-15", name: "Application Layer", completed: false },
                        { id: "itn-16", name: "Network Security Fundamentals", completed: false },
                        { id: "itn-17", name: "Build a Small Network", completed: false }
                    ]
                },
                {
                    id: "net-ccna-srwe",
                    label: "SRWE v7.0",
                    type: "certification",
                    category: "network",
                    icon: "ri-git-merge-line",
                    meta: "Switching, Routing, and Wireless Essentials.",
                    externalLink: { label: "View Cisco Badge", url: "#" },
                    modules: [
                        { id: "srwe-1", name: "Basic Device Configuration", completed: false },
                        { id: "srwe-2", name: "Switching Concepts", completed: false },
                        { id: "srwe-3", name: "VLANs (Virtual LANs)", completed: false },
                        { id: "srwe-4", name: "Inter-VLAN Routing", completed: false },
                        { id: "srwe-5", name: "STP Concepts (Spanning Tree)", completed: false },
                        { id: "srwe-6", name: "EtherChannel (Link Aggregation)", completed: false },
                        { id: "srwe-7", name: "DHCPv4", completed: false },
                        { id: "srwe-8", name: "SLAAC and DHCPv6", completed: false },
                        { id: "srwe-9", name: "FHRP (HSRP Redundancy)", completed: false },
                        { id: "srwe-10", name: "LAN Security Concepts", completed: false },
                        { id: "srwe-11", name: "Switch Security Configuration", completed: false },
                        { id: "srwe-12", name: "WLAN Concepts (Wireless)", completed: false },
                        { id: "srwe-13", name: "WLAN Configuration", completed: false },
                        { id: "srwe-14", name: "Routing Concepts", completed: false },
                        { id: "srwe-15", name: "IP Static Routing", completed: false },
                        { id: "srwe-16", name: "Troubleshoot Static and Default Routes", completed: false }
                    ]
                },
                {
                    id: "net-ccna-ensa",
                    label: "ENSA v7.0",
                    type: "target focus",
                    category: "network",
                    icon: "ri-shield-keyhole-line",
                    meta: "Enterprise Networking, Security, and Automation. The 'High-Brainpower' Zone.",
                    modules: [
                        { id: "ensa-1", name: "Single-Area OSPFv2 Concepts", completed: false },
                        { id: "ensa-2", name: "Single-Area OSPFv2 Configuration", completed: false },
                        { id: "ensa-3", name: "Network Security Concepts", completed: false },
                        { id: "ensa-4", name: "ACL Concepts (Access Control Lists)", completed: false },
                        { id: "ensa-5", name: "ACLs for IPv4 Configuration", completed: false },
                        { id: "ensa-6", name: "NAT for IPv4", completed: false },
                        { id: "ensa-7", name: "WAN Concepts", completed: false },
                        { id: "ensa-8", name: "VPN and IPsec Concepts", completed: false },
                        { id: "ensa-9", name: "QoS Concepts (Quality of Service)", completed: false },
                        { id: "ensa-10", name: "Network Management (SNMP/Syslog)", completed: false },
                        { id: "ensa-11", name: "Network Design", completed: false },
                        { id: "ensa-12", name: "Network Troubleshooting", completed: false },
                        { id: "ensa-13", name: "Network Virtualization", completed: false },
                        { id: "ensa-14", name: "Automation and Programmability", completed: false }
                    ]
                },
                {
                    id: "net-adv-routing",
                    label: "Advanced Routing",
                    type: "isp tier",
                    category: "network",
                    icon: "ri-route-line",
                    meta: "Mastering BGP and MPLS for large-scale enterprise/ISP environments.",
                    externalLink: { label: "NSRC Workshops", url: "#" },
                    modules: [
                        { id: "adv-1", name: "Build Mini-Internet Lab (GNS3/EVE-NG)", completed: false },
                        { id: "adv-2", name: "BGP Autonomous Systems Routing", completed: false }
                    ]
                },
                {
                    id: "net-programmability",
                    label: "Programmability",
                    type: "netdevops",
                    category: "network",
                    icon: "ri-terminal-box-line",
                    meta: "Moving from manual typing to writing code that manages the network.",
                    externalLink: { label: "View GitHub Automations", url: "#" },
                    modules: [
                        { id: "prog-1", name: "Netmiko & NAPALM Fundamentals", completed: false },
                        { id: "prog-2", name: "Automate OSPF across 10 virtual routers", completed: false }
                    ]
                }
            ]
        },
        {
            id: "branch-telecom",
            label: "Telecommunications",
            category: "telecom",
            icon: "ri-base-station-line",
            meta: "Transition from traditional radio frequency studies to Software-Defined Telecom, Cloud-Native 5G, and IoT integrations.",
            children: [
                {
                    id: "tel-optical",
                    label: "Optical Systems",
                    type: "hardware design",
                    category: "telecom",
                    icon: "ri-dashboard-3-line",
                    meta: "DWDM and GPON architecture using Optisystem v7.0.",
                    modules: [
                        { id: "opt-1", name: "Simulate long-haul fiber link", completed: false },
                        { id: "opt-2", name: "Support Smart City Bandwidth Req.", completed: false }
                    ]
                },
                {
                    id: "tel-iot",
                    label: "Massive IoT",
                    type: "lpwan",
                    category: "telecom",
                    icon: "ri-sensor-line",
                    meta: "Expanding the LoRa Smart Smoke Detector hardware project into a full system.",
                    modules: [
                        { id: "iot-1", name: "LoRaWAN Integration", completed: false },
                        { id: "iot-2", name: "Cloud MQTT broker integration", completed: false },
                        { id: "iot-3", name: "Visualize real-time sensor data", completed: false }
                    ]
                },
                {
                    id: "tel-5g",
                    label: "5G Core",
                    type: "cloud native",
                    category: "telecom",
                    icon: "ri-cloud-line",
                    meta: "Softwarization of telecom network (NFV/SDN). Moving to open standards (O-RAN).",
                    externalLink: { label: "LFS114 (Intro to free5GC)", url: "#" },
                    modules: [
                        { id: "5g-1", name: "Service-Based Architecture (SBA)", completed: false },
                        { id: "5g-2", name: "Network Slicing", completed: false },
                        { id: "5g-3", name: "Deploy AMF, SMF, UPF in Docker/K8s", completed: false }
                    ]
                }
            ]
        },
        {
            id: "branch-cyber",
            label: "Cybersecurity & Drills",
            category: "cyber",
            icon: "ri-shield-cross-line",
            meta: "Excel in high-pressure Attack/Defense environments, focusing on uptime, real-time traffic analysis, and forensic reporting.",
            children: [
                {
                    id: "cyb-foundation",
                    label: "Foundation",
                    type: "certification",
                    category: "cyber",
                    icon: "ri-file-shield-line",
                    meta: "The Professional Security Foundation.",
                    modules: [
                        { id: "fnd-1", name: "ISC2 CC Certification", completed: false },
                        { id: "fnd-2", name: "Security Principles & Controls", completed: false },
                        { id: "fnd-3", name: "BCDR (Business Continuity / Disaster Recovery)", completed: false }
                    ]
                },
                {
                    id: "cyb-attack-def",
                    label: "Attack/Defense",
                    type: "mastery",
                    category: "cyber",
                    icon: "ri-sword-line",
                    meta: "King of the Hill and Service-Based CTFs (maintain service uptime).",
                    externalLink: { label: "TryHackMe Profile", url: "#" },
                    modules: [
                        { id: "ad-1", name: "Traffic Analysis (Wireshark/Suricata)", completed: false },
                        { id: "ad-2", name: "Rapid Hardening Scripts (Python)", completed: false },
                        { id: "ad-3", name: "Offensive Testing (PrivEsc/Web)", completed: false }
                    ]
                },
                {
                    id: "cyb-forensics",
                    label: "Capture Evidence",
                    type: "reporting",
                    category: "cyber",
                    icon: "ri-microscope-line",
                    meta: "Digital forensics and writing Post-Mortem reports for stakeholders.",
                    modules: [
                        { id: "for-1", name: "Participate in ITU CyberDrill/CCDC", completed: false },
                        { id: "for-2", name: "Write formal Incident Report", completed: false },
                        { id: "for-3", name: "Log analysis and memory dumps", completed: false }
                    ]
                }
            ]
        }
    ]
};
