package com.smi.service;

import com.smi.model.DashboardStat;
import java.util.List;

/**
 *
 * @author Nejm
 */
public interface DashboardStatService {

    Long save(DashboardStat dashboard);

    void edit(DashboardStat dashboard);
    void delete(DashboardStat dashboardStat);
    List<DashboardStat> findByStatId(Long id);
    List<DashboardStat> getByDashboardId(Long id);
}
