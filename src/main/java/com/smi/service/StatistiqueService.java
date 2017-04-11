package com.smi.service;

import com.smi.model.Statistique;
import java.util.List;

/**
 *
 * @author Nejm
 */
public interface StatistiqueService {
        
    Statistique findById(long id);
    List<Statistique> findAll();
    Long add(Statistique s);
    void edit(Statistique s);
    List<Statistique> findStat();
    boolean exist(String name);
    List<Statistique> findMyStat(String name);
    List<Statistique> findAvailableStat(String name);
}
