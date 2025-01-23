from dataclasses import dataclass, field


@dataclass
class FullAcquiredMarker:
    name: str
    accession: str
    gene: str
    antibiotics: list[str]


@dataclass
class FullVariantMarker(FullAcquiredMarker):
    variant: str


@dataclass
class VariantSite:
    name: str
    queryStart: int
    queryStop: int
    refStart: int
    refStop: int


@dataclass
class GeneMatch:
    pid: float
    queryId: str
    queryStart: int
    queryStop: int
    refId: str
    refStart: int
    refStop: int
    resistanceVariants: list[str]
    forward: bool


@dataclass
class Agent:
    name: str
    type: str


@dataclass
class RpAcquired:
    gene: str
    resistanceEffect: str = "RESISTANCE"


@dataclass
class RpVariant:
    gene: str
    variant: str
    resistanceEffect: str


@dataclass
class Determinants:
    acquired: list[RpAcquired] = field(default_factory=list)
    variants: list[RpVariant] = field(default_factory=list)


@dataclass
class AntimicrobialPhenotype:
    agent: Agent
    state: str
    determinants: Determinants


@dataclass
class PwResult:
    versions: dict[str, str]
    acquired: list[FullAcquiredMarker]
    matches: list[GeneMatch]
    variants: list[FullVariantMarker]
    resistanceProfile: list[AntimicrobialPhenotype]
