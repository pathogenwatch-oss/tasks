import dataclasses


@dataclasses.dataclass
class FullAcquiredMarker:
    name: str
    accession: str
    gene: str
    antibiotics: list[str]


@dataclasses.dataclass
class FullVariantMarker(FullAcquiredMarker):
    variant: str


@dataclasses.dataclass
class VariantSite:
    name: str
    queryStart: int
    queryStop: int
    refStart: int
    refStop: int


@dataclasses.dataclass
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


@dataclasses.dataclass
class Agent:
    name: str
    type: str


@dataclasses.dataclass
class RpAcquired:
    gene: str
    resistanceEffect: str = "RESISTANCE"


@dataclasses.dataclass
class RpVariant:
    gene: str
    variant: str
    resistanceEffect: str


@dataclasses.dataclass
class Determinants:
    acquired: list[RpAcquired]
    variants: list[RpVariant]


@dataclasses.dataclass
class AntimicrobialPhenotype:
    agent: Agent
    state: str
    determinants: Determinants


@dataclasses.dataclass
class Versions:
    resfinderVersion: str
    resfinderDbVersion: str
    pointfinderDbVersion: str
    disinfinderDbVersion: str


@dataclasses.dataclass
class PwResult:
    versions: Versions
    acquired: list[FullAcquiredMarker]
    matches: list[GeneMatch]
    variants: list[FullVariantMarker]
    resistanceProfile: list[AntimicrobialPhenotype]
