/**
 * Results Screen
 * 
 * Professional results display with search and detailed view
 * Based on ViewResult.jsx from React website
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Subject {
  name: string;
  marks: number;
  maxMarks: number;
}

interface ResultType {
  _id: string;
  grNumber: string;
  studentName: string;
  standard: string;
  term: string;
  subjects: Subject[];
  remarks?: string;
  createdAt: string;
  uploadedBy?: {
    name: string;
    employeeId: string;
  };
}

const ResultsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [results, setResults] = useState<ResultType[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<ResultType | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredResults(results);
    } else {
      const filtered = results.filter(result =>
        result.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.standard.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
    }
  }, [searchTerm, results]);

  const loadResults = async () => {
    try {
      // Mock data for demonstration - replace with actual API call
      const mockResults: ResultType[] = [
        {
          _id: '1',
          grNumber: 'GR2024001',
          studentName: 'Student Name',
          standard: 'STD-9',
          term: 'First Term',
          subjects: [
            { name: 'Mathematics', marks: 85, maxMarks: 100 },
            { name: 'Science', marks: 78, maxMarks: 100 },
            { name: 'English', marks: 82, maxMarks: 100 },
            { name: 'Hindi', marks: 75, maxMarks: 100 },
            { name: 'Social Science', marks: 88, maxMarks: 100 },
          ],
          remarks: 'Excellent performance. Keep up the good work!',
          createdAt: new Date().toISOString(),
          uploadedBy: { name: 'Teacher Name', employeeId: 'EMP001' }
        }
      ];
      setResults(mockResults);
      setFilteredResults(mockResults);
    } catch (error) {
      console.error('Error loading results:', error);
      Alert.alert('Error', 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  const formatStandard = (standard: string) => {
    if (!standard) return 'N/A';
    const stdStr = String(standard).trim();
    if (stdStr.toLowerCase().includes('balvatika')) return 'Balvatika';
    const match = stdStr.match(/\d+/);
    if (match) return `STD-${match[0]}`;
    return stdStr;
  };

  const calculateTotalMarks = (subjects: Subject[]) => {
    return subjects.reduce((sum, sub) => sum + sub.marks, 0);
  };

  const calculateTotalMaxMarks = (subjects: Subject[]) => {
    return subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
  };

  const calculatePercentage = (subjects: Subject[]) => {
    const total = calculateTotalMarks(subjects);
    const maxTotal = calculateTotalMaxMarks(subjects);
    return ((total / maxTotal) * 100).toFixed(2);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 80) return { grade: 'A', color: '#10b981' };
    if (percentage >= 65) return { grade: 'B', color: '#3b82f6' };
    if (percentage >= 50) return { grade: 'C', color: '#f59e0b' };
    if (percentage >= 35) return { grade: 'D', color: '#f97316' };
    return { grade: 'F', color: '#ef4444' };
  };

  const getMarksColor = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#3b82f6';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading results...</Text>
      </View>
    );
  }

  if (selectedResult) {
    const percentage = parseFloat(calculatePercentage(selectedResult.subjects));
    const gradeInfo = getGrade(percentage);

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
        {/* Back Button */}
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
          onPress={() => setSelectedResult(null)}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
          <Text style={[styles.backText, { color: theme.colors.text }]}>Back to Results</Text>
        </TouchableOpacity>

        {/* Result Detail Card */}
        <View style={[styles.detailCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {/* Badge */}
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: theme.colors.primaryLight + '30' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>Latest Result</Text>
            </View>
          </View>

          {/* Student Info Header */}
          <View style={[styles.studentHeader, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.studentInfo}>
              <View style={styles.studentNameRow}>
                <Icon name="person" size={24} color={theme.colors.text} />
                <Text style={[styles.studentName, { color: theme.colors.text }]}>{selectedResult.studentName}</Text>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>GR Number:</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{selectedResult.grNumber}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Standard:</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatStandard(selectedResult.standard)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Exam Type:</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{selectedResult.term}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Date:</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {new Date(selectedResult.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.gradeSection}>
              <View style={[styles.gradeBadge, { backgroundColor: `${gradeInfo.color}20` }]}>
                <Icon name="trophy" size={32} color={gradeInfo.color} />
              </View>
              <View style={[styles.gradeCircle, { backgroundColor: `${gradeInfo.color}20` }]}>
                <Text style={[styles.gradeText, { color: gradeInfo.color }]}>
                  {gradeInfo.grade}
                </Text>
              </View>
            </View>
          </View>

          {/* Subject Performance Table */}
          <View style={styles.tableSection}>
            <View style={styles.tableTitleRow}>
              <Icon name="book" size={20} color={theme.colors.text} />
              <Text style={[styles.tableTitle, { color: theme.colors.text }]}>Subject-wise Performance</Text>
            </View>
            
            <View style={[styles.table, { borderColor: theme.colors.border }]}>
              <View style={[styles.tableHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.tableHeaderText, styles.subjectCol, { color: theme.colors.textSecondary }]}>Subject</Text>
                <Text style={[styles.tableHeaderText, styles.marksCol, { color: theme.colors.textSecondary }]}>Marks</Text>
                <Text style={[styles.tableHeaderText, styles.marksCol, { color: theme.colors.textSecondary }]}>Max</Text>
                <Text style={[styles.tableHeaderText, styles.percentCol, { color: theme.colors.textSecondary }]}>%</Text>
              </View>
              
              {selectedResult.subjects.map((subject, index) => {
                const subPercent = ((subject.marks / subject.maxMarks) * 100).toFixed(1);
                const color = getMarksColor(subject.marks, subject.maxMarks);
                
                return (
                  <View key={index} style={[styles.tableRow, { borderBottomColor: theme.colors.border }]}>
                    <Text style={[styles.tableCellText, styles.subjectCol, { color: theme.colors.text }]}>{subject.name}</Text>
                    <Text style={[styles.tableCellValue, styles.marksCol, { color }]}>
                      {subject.marks}
                    </Text>
                    <Text style={[styles.tableCellText, styles.marksCol, { color: theme.colors.text }]}>{subject.maxMarks}</Text>
                    <Text style={[styles.tableCellValue, styles.percentCol, { color }]}>
                      {subPercent}%
                    </Text>
                  </View>
                );
              })}
              
              <View style={[styles.tableTotalRow, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.tableTotalText, styles.subjectCol, { color: theme.colors.text }]}>Total</Text>
                <Text style={[styles.tableTotalText, styles.marksCol, { color: theme.colors.text }]}>
                  {calculateTotalMarks(selectedResult.subjects)}
                </Text>
                <Text style={[styles.tableTotalText, styles.marksCol, { color: theme.colors.text }]}>
                  {calculateTotalMaxMarks(selectedResult.subjects)}
                </Text>
                <Text style={[styles.tableTotalText, styles.percentCol, { color: theme.colors.text }]}>
                  {percentage}%
                </Text>
              </View>
            </View>
          </View>

          {/* Remarks */}
          {selectedResult.remarks && (
            <View style={[styles.remarksSection, { backgroundColor: theme.colors.primaryLight + '20', borderColor: theme.colors.primaryLight }]}>
              <Text style={[styles.remarksTitle, { color: theme.colors.text }]}>Remarks:</Text>
              <Text style={[styles.remarksText, { color: theme.colors.textSecondary }]}>{selectedResult.remarks}</Text>
            </View>
          )}

          {/* Upload Info */}
          {selectedResult.uploadedBy && (
            <View style={[styles.uploadInfo, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.uploadInfoText, { color: theme.colors.textTertiary }]}>
                Uploaded by: {selectedResult.uploadedBy.name} (ID: {selectedResult.uploadedBy.employeeId})
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerTop}>
          <Icon name="document-text" size={32} color={theme.colors.text} />
          <Text style={[styles.title, { color: theme.colors.text }]}>My Results</Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          View all your exam results and performance
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search by term or standard..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={theme.colors.placeholder}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results List */}
      {filteredResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsCount, { color: theme.colors.textSecondary }]}>
            {filteredResults.length} {filteredResults.length === 1 ? 'Result' : 'Results'} Found
          </Text>
          
          {filteredResults.map((result, index) => {
            const percentage = parseFloat(calculatePercentage(result.subjects));
            const gradeInfo = getGrade(percentage);
            
            return (
              <TouchableOpacity
                key={result._id || index}
                style={[styles.resultCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => setSelectedResult(result)}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleSection}>
                    <Text style={[styles.cardTerm, { color: theme.colors.text }]}>{result.term}</Text>
                    <Text style={[styles.cardStandard, { color: theme.colors.textSecondary }]}>{formatStandard(result.standard)}</Text>
                  </View>
                  <View style={[styles.cardGrade, { backgroundColor: `${gradeInfo.color}20` }]}>
                    <Text style={[styles.cardGradeText, { color: gradeInfo.color }]}>
                      {gradeInfo.grade}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardStats}>
                  <View style={styles.cardStat}>
                    <Icon name="checkmark-circle" size={16} color={theme.colors.primary} />
                    <Text style={[styles.cardStatLabel, { color: theme.colors.textSecondary }]}>Total: </Text>
                    <Text style={[styles.cardStatValue, { color: theme.colors.text }]}>
                      {calculateTotalMarks(result.subjects)}/{calculateTotalMaxMarks(result.subjects)}
                    </Text>
                  </View>
                  <View style={styles.cardStat}>
                    <Icon name="trending-up" size={16} color={theme.colors.primary} />
                    <Text style={[styles.cardStatLabel, { color: theme.colors.textSecondary }]}>Percentage: </Text>
                    <Text style={[styles.cardStatValue, { color: gradeInfo.color, fontWeight: '600' }]}>
                      {percentage}%
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.cardDate, { color: theme.colors.textTertiary }]}>
                    {new Date(result.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.viewDetails}>
                    <Text style={[styles.viewDetailsText, { color: theme.colors.primary }]}>View Details</Text>
                    <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="document-text-outline" size={64} color={theme.colors.disabled} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Results Found</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {searchTerm ? 'No results match your search' : 'You have no results yet'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleSection: {
    flex: 1,
  },
  cardTerm: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardStandard: {
    fontSize: 14,
  },
  cardGrade: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardGradeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardStats: {
    marginBottom: 12,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardStatLabel: {
    fontSize: 14,
    marginLeft: 6,
  },
  cardStatValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cardDate: {
    fontSize: 12,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Detail View Styles
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  detailCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeContainer: {
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  studentInfo: {
    flex: 1,
    marginRight: 16,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  gradeSection: {
    alignItems: 'center',
  },
  gradeBadge: {
    borderRadius: 50,
    padding: 12,
    marginBottom: 8,
  },
  gradeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tableSection: {
    marginBottom: 20,
  },
  tableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  table: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  tableCellText: {
    fontSize: 14,
  },
  tableCellValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableTotalRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableTotalText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  subjectCol: {
    flex: 2,
  },
  marksCol: {
    flex: 1,
    textAlign: 'center',
  },
  percentCol: {
    flex: 1,
    textAlign: 'center',
  },
  remarksSection: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  remarksTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  remarksText: {
    fontSize: 14,
    lineHeight: 20,
  },
  uploadInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
  uploadInfoText: {
    fontSize: 12,
  },
});

export default ResultsScreen;
