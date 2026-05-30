from datetime import date, datetime
from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class Supervisor(Base):
    __tablename__ = "supervisores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)

    reponedores = relationship("Reponedor", back_populates="supervisor")
    pdvs = relationship("PDV", back_populates="supervisor")


class Reponedor(Base):
    __tablename__ = "reponedores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    supervisor_id = Column(Integer, ForeignKey("supervisores.id"), nullable=False)

    supervisor = relationship("Supervisor", back_populates="reponedores")
    pdvs = relationship("PDV", back_populates="reponedor")
    visitas = relationship("Visita", back_populates="reponedor")


class PDV(Base):
    __tablename__ = "pdvs"

    id = Column(Integer, primary_key=True, index=True)
    nro = Column(Integer, nullable=False)
    mercado = Column(String(100), nullable=False)
    categoria = Column(String(50), nullable=False)
    codigo = Column(String(50), nullable=True)  # not unique; some are duplicates or non-numeric in source data
    cliente = Column(String(50), nullable=False, unique=True)  # GV001–GV474, true unique key
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    supervisor_id = Column(Integer, ForeignKey("supervisores.id"), nullable=False)
    reponedor_id = Column(Integer, ForeignKey("reponedores.id"), nullable=False)
    visita_minutos = Column(Integer, nullable=False)
    lunes = Column(Boolean, default=False)
    martes = Column(Boolean, default=False)
    miercoles = Column(Boolean, default=False)
    jueves = Column(Boolean, default=False)
    viernes = Column(Boolean, default=False)
    sabado = Column(Boolean, default=False)
    semanal = Column(Integer, nullable=False)
    mensual = Column(Integer, nullable=False)

    supervisor = relationship("Supervisor", back_populates="pdvs")
    reponedor = relationship("Reponedor", back_populates="pdvs")
    visitas = relationship("Visita", back_populates="pdv")


class Visita(Base):
    __tablename__ = "visitas"

    id = Column(Integer, primary_key=True, index=True)
    pdv_id = Column(Integer, ForeignKey("pdvs.id"), nullable=False)
    reponedor_id = Column(Integer, ForeignKey("reponedores.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(DateTime, nullable=True)
    hora_fin = Column(DateTime, nullable=True)
    foto_url = Column(String(500), nullable=True)
    estado = Column(String(20), nullable=False, default="pendiente")
    notas = Column(Text, nullable=True)

    pdv = relationship("PDV", back_populates="visitas")
    reponedor = relationship("Reponedor", back_populates="visitas")


class DepositoPOP(Base):
    __tablename__ = "depositos_pop"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True)
